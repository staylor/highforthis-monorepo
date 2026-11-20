import * as assert from 'remix/assert';
import { renderToString } from 'remix/component/server';
import { describe, it } from 'remix/test';

import type { PostArtwork_PostFragment } from '#/types/graphql.ts';

import { PostArtwork } from './post-artwork.tsx';

function image(id: string, widths = [300, 640]) {
  return {
    __typename: 'ImageUpload' as const,
    crops: widths.map((width) => ({ fileName: `${id}-${width}.jpg`, width })),
    destination: 'posts',
    id,
  };
}

function post(editorImageCount: number): PostArtwork_PostFragment {
  return {
    editorState: {
      root: {
        children: Array.from({ length: editorImageCount }, (_, index) => ({
          __typename: 'ImageNode' as const,
          image: image(`editor-${index + 1}`),
        })),
      },
    },
    featuredMedia: [image('featured')],
  };
}

const sources = (html: string) =>
  [...html.matchAll(/<img[^>]* src="([^"]+)"/g)].map(([, src]) => src);

describe('PostArtwork', () => {
  it('builds a deterministic randomized collage from five unique editor images', async () => {
    const data = post(10);
    data.editorState?.root?.children?.push(data.editorState.root.children[0]);
    const sourcesForSeed = async (seed: string) =>
      sources(await renderToString(<PostArtwork post={data} seed={seed} variant="collage" />));

    const collage = await sourcesForSeed('page-a');
    assert.equal(collage.length, 5);
    assert.equal(new Set(collage).size, 5);
    assert.ok(collage.every((src) => src.includes('/editor-')));
    assert.deepEqual(await sourcesForSeed('page-a'), collage);
    assert.notDeepEqual(await sourcesForSeed('page-b'), collage);
  });

  it('uses a fanned stack and shows the number of additional images', async () => {
    const html = await renderToString(
      <PostArtwork post={post(6)} seed="stack-seed" variant="stack" />
    );
    assert.equal(sources(html).length, 3);
    assert.match(html, />\+3</);
  });

  it('falls back to featured media when the editor has no images', async () => {
    const html = await renderToString(
      <PostArtwork post={post(0)} seed="fallback-seed" variant="collage" />
    );
    assert.equal(
      sources(html)[0],
      'https://storage.googleapis.com/wonderboymusic/posts/featured-640.jpg'
    );
  });
});
