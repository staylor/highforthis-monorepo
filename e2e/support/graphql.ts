import type { APIRequestContext } from '@playwright/test';

import { credentials } from './env.ts';

// The tests set up data, check what was saved and clean up through the GraphQL server directly,
// signed in as the test admin. It's independent of the admin's UI, so a rewrite of the admin
// can't break the setup or the cleanup.

interface Connection<T> {
  count: number;
  edges: { node: T }[];
}

interface MediaUpload {
  id: string;
  destination: string;
  crops: { fileName: string; width: number }[];
}

interface Post {
  id: string;
  title: string;
  featuredMedia: MediaUpload[];
}

interface Show {
  id: string;
  title: string | null;
  attended: boolean;
  venue: { name: string };
}

interface User {
  id: string;
  name: string;
  bio?: string | null;
}

interface Entity {
  id: string;
  name: string;
}

export class GraphQL {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly token: string
  ) {}

  static async signIn(request: APIRequestContext) {
    const { email, password } = credentials();
    const response = await request.post('/auth', { data: { email, password } });
    const { token, error } = await response.json();
    if (!token) {
      throw new Error(`The test admin couldn't sign in (${error}). Run \`pnpm e2e:admin\`.`);
    }
    return new GraphQL(request, token);
  }

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.request.post('/graphql', {
      data: { query, variables },
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const { data, errors } = await response.json();
    if (errors?.length) {
      throw new Error(errors.map((e: { message: string }) => e.message).join('\n'));
    }
    return data;
  }

  async createPost(input: { title: string; date?: number }) {
    const { createPost } = await this.query<{ createPost: Post }>(
      `mutation ($input: CreatePostInput!) { createPost(input: $input) { id title } }`,
      // Drafts stay off the public site
      { input: { status: 'DRAFT', ...input } }
    );
    return createPost;
  }

  async post(id: string) {
    const { post } = await this.query<{ post: Post | null }>(
      `query ($id: String!) {
        post(id: $id) {
          id
          title
          featuredMedia { id destination ... on ImageUpload { crops { fileName width } } }
        }
      }`,
      { id }
    );
    return post;
  }

  async createVenue(name: string) {
    const { createVenue } = await this.query<{ createVenue: Entity }>(
      `mutation ($input: CreateVenueInput!) { createVenue(input: $input) { id name } }`,
      { input: { name } }
    );
    return createVenue;
  }

  async venue(id: string) {
    const { venue } = await this.query<{ venue: Entity | null }>(
      `query ($id: String!) { venue(id: $id) { id name } }`,
      { id }
    );
    return venue;
  }

  async firstArtist() {
    const { artists } = await this.query<{ artists: Connection<Entity> }>(
      `{ artists(first: 1) { count edges { node { id name } } } }`
    );
    return artists.edges[0].node;
  }

  async createShow(input: { title: string; artists: string[]; venue: string }) {
    const { createShow } = await this.query<{ createShow: Show }>(
      `mutation ($input: CreateShowInput!) { createShow(input: $input) { id title } }`,
      { input: { date: Date.now(), ...input } }
    );
    return createShow;
  }

  async show(id: string) {
    const { show } = await this.query<{ show: Show | null }>(
      `query ($id: String!) { show(id: $id) { id title attended venue { name } } }`,
      { id }
    );
    return show;
  }

  async user(id: string) {
    const { user } = await this.query<{ user: User | null }>(
      `query ($id: String!) { user(id: $id) { id name bio } }`,
      { id }
    );
    return user;
  }

  /**
   * Removes the posts, shows, venues, artists and users whose title or name starts with `prefix`.
   * Shows go first, since a venue can't be removed while a show is at it.
   */
  async removeMatching(prefix: string) {
    const found = await this.query<{
      posts: Connection<Post>;
      shows: Connection<Show>;
      venues: Connection<Entity>;
      artists: Connection<Entity>;
      users: Connection<User>;
    }>(
      `query ($search: String) {
        posts(search: $search, first: 500) { count edges { node { id title } } }
        shows(search: $search, first: 500) { count edges { node { id title venue { name } } } }
        venues(search: $search, first: 500) { count edges { node { id name } } }
        artists(search: $search, first: 500) { count edges { node { id name } } }
        users(search: $search, first: 500) { count edges { node { id name } } }
      }`,
      { search: prefix }
    );
    const ids = <T extends { id: string }>(
      connection: Connection<T>,
      matches: (node: T) => boolean
    ) =>
      connection.edges
        .map(({ node }) => node)
        .filter(matches)
        .map(({ id }) => id);

    const removals: [string, string[]][] = [
      [
        'removeShow',
        ids(
          found.shows,
          (show) => Boolean(show.title?.startsWith(prefix)) || show.venue.name.startsWith(prefix)
        ),
      ],
      ['removeVenue', ids(found.venues, (venue) => venue.name.startsWith(prefix))],
      ['removeArtist', ids(found.artists, (artist) => artist.name.startsWith(prefix))],
      ['removePost', ids(found.posts, (post) => post.title.startsWith(prefix))],
      ['removeUser', ids(found.users, (user) => user.name.startsWith(prefix))],
    ];
    for (const [mutation, removing] of removals) {
      if (removing.length === 0) {
        continue;
      }
      const result = await this.query<Record<string, boolean>>(
        `mutation ($ids: [String]!) { ${mutation}(ids: $ids) }`,
        { ids: removing }
      );
      if (!result[mutation]) {
        throw new Error(`${mutation} failed for ${removing.join(', ')}`);
      }
    }
  }
}
