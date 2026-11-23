import { ApolloServer } from '@apollo/server';
import { inList } from 'remix/data-table';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { mediaDetails, mediaUploads, postMedia, posts, postTags } from '#/database/tables';
import type { AppContext } from '#/models';
import resolvers from '#/resolvers';
import typeDefs from '#/schema';

import postResolvers from '../Post';

const { db, postsQuery } = vi.hoisted(() => ({
  db: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    query: vi.fn(),
    update: vi.fn(),
  },
  postsQuery: {
    all: vi.fn(),
    count: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn(),
    with: vi.fn(),
  },
}));

vi.mock('#/database', () => ({ default: {} }));
vi.mock('#/database/db', () => ({ default: db }));

const crops = (id: string) => [{ fileName: `${id}-640.jpg`, width: 640, height: 480, fileSize: 1 }];

// An image as its query loads it, with its crops
const image = (id: string) => ({ id, type: 'image', crops: crops(id) });

// What the artwork on the home page and /posts asks for
const artworkQuery = /* GraphQL */ `
  {
    posts(first: 50, status: PUBLISH) {
      edges {
        node {
          editorState {
            root {
              children {
                ... on ImageNode {
                  image {
                    id
                    crops {
                      fileName
                      width
                    }
                  }
                }
              }
            }
          }
          featuredMedia {
            id
            ... on ImageUpload {
              crops {
                fileName
                width
              }
            }
          }
        }
      }
    }
  }
`;

describe('posts', () => {
  let server: ApolloServer<AppContext>;

  beforeAll(async () => {
    server = new ApolloServer<AppContext>({ typeDefs, resolvers });
    await server.start();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    for (const step of [
      postsQuery.limit,
      postsQuery.offset,
      postsQuery.orderBy,
      postsQuery.where,
      postsQuery.with,
    ]) {
      step.mockReturnValue(postsQuery);
    }
    db.query.mockReturnValue(postsQuery);
    postsQuery.count.mockResolvedValue(1);
    postsQuery.all.mockImplementation(async () => {
      return [
        {
          id: 'post-1',
          editorState: {
            root: {
              type: 'root',
              children: [
                { type: 'image', imageId: 'body-1' },
                { type: 'paragraph', children: [] },
                { type: 'image', imageId: 'body-2' },
              ],
            },
          },
          featuredMedia: [{ media: image('featured') }],
        },
      ];
    });
    db.findMany.mockImplementation(async (table, { where }) =>
      table === mediaUploads ? where.value.map(image) : []
    );
  });

  afterAll(() => server.stop());

  it("loads the artwork's crops with the images, not with a query per image", async () => {
    const response = await server.executeOperation({ query: artworkQuery }, { contextValue: {} });

    if (response.body.kind !== 'single') throw new Error('Expected a single result');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      posts: {
        edges: [
          {
            node: {
              editorState: {
                root: {
                  children: [
                    {
                      image: { id: 'body-1', crops: [{ fileName: 'body-1-640.jpg', width: 640 }] },
                    },
                    {},
                    {
                      image: { id: 'body-2', crops: [{ fileName: 'body-2-640.jpg', width: 640 }] },
                    },
                  ],
                },
              },
              featuredMedia: [
                { id: 'featured', crops: [{ fileName: 'featured-640.jpg', width: 640 }] },
              ],
            },
          },
        ],
      },
    });
    // The post's images in one query, with their crops, and the featured media's with the post
    expect(db.findMany).toHaveBeenCalledExactlyOnceWith(mediaUploads, {
      where: inList('id', ['body-1', 'body-2']),
      with: { crops: mediaDetails.crops },
    });
    expect(postsQuery.with).toHaveBeenCalledWith({ featuredMedia: postMedia, artists: postTags });
  });
});

describe('updatePost', () => {
  const { updatePost } = postResolvers.Mutation;

  beforeEach(() => {
    vi.resetAllMocks();
    db.update.mockResolvedValue({ id: 'post-1' });
  });

  it('saves a new date', async () => {
    await updatePost({}, { id: 'post-1', input: { date: Date.UTC(2026, 10, 21) } });

    expect(db.update).toHaveBeenLastCalledWith(
      posts,
      'post-1',
      { date: new Date('2026-11-21T00:00:00Z') },
      expect.anything()
    );
  });

  // The column is NOT NULL, since every post has a date
  it('keeps the saved date when the date is sent as null', async () => {
    await updatePost({}, { id: 'post-1', input: { date: null, title: 'Renamed' } });

    expect(db.update).toHaveBeenLastCalledWith(
      posts,
      'post-1',
      { title: 'Renamed' },
      expect.anything()
    );
  });
});
