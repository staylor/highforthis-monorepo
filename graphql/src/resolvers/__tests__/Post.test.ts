import { ApolloServer } from '@apollo/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppContext } from '#/models';
import resolvers from '#/resolvers';
import typeDefs from '#/schema';

import postResolvers from '../Post';

const db = vi.hoisted(() => ({
  post: { count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  postArtist: { deleteMany: vi.fn() },
  mediaUpload: { findUnique: vi.fn() },
  imageUploadCrop: { findMany: vi.fn() },
}));

vi.mock('#/database', () => ({ default: db }));

const crops = (id: string) => [{ fileName: `${id}-640.jpg`, width: 640, height: 480, fileSize: 1 }];

// Images as Prisma loads them: with their crops only when the query includes them
const image = (id: string, include?: { crops?: boolean }) => ({
  id,
  type: 'image',
  ...(include?.crops && { crops: crops(id) }),
});

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
    db.post.count.mockResolvedValue(1);
    db.post.findMany.mockImplementation(async ({ include }) => {
      const { media } = include.featuredMedia.include;
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
          featuredMedia: [{ media: image('featured', media === true ? undefined : media.include) }],
        },
      ];
    });
    db.mediaUpload.findUnique.mockImplementation(async ({ where, include }) =>
      image(where.id, include)
    );
    db.imageUploadCrop.findMany.mockImplementation(async ({ where }) => crops(where.mediaId));
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
    expect(db.imageUploadCrop.findMany).not.toHaveBeenCalled();
  });
});

describe('updatePost', () => {
  const { updatePost } = postResolvers.Mutation;

  beforeEach(() => {
    vi.resetAllMocks();
    db.post.update.mockResolvedValue({ id: 'post-1' });
  });

  it('saves a new date', async () => {
    await updatePost({}, { id: 'post-1', input: { date: Date.UTC(2026, 10, 21) } });

    expect(db.post.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: 'post-1' },
        data: { date: new Date('2026-11-21T00:00:00Z') },
      })
    );
  });

  // Prisma turns away a null date, since every post has one
  it('keeps the saved date when the date is sent as null', async () => {
    await updatePost({}, { id: 'post-1', input: { date: null, title: 'Renamed' } });

    expect(db.post.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { title: 'Renamed' } })
    );
  });
});
