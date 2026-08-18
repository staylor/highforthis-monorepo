import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PostArtwork from '#/components/PostArtwork';
import type { PostArtwork_PostFragment } from '#/types/graphql';

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

describe('postArtwork', () => {
  it('builds a deterministic randomized collage from five unique editor images', () => {
    const data = post(10);
    data.editorState?.root?.children?.push(data.editorState.root.children[0]);
    const sourcesForSeed = (seed: string) => {
      const { container, unmount } = render(
        <PostArtwork post={data} seed={seed} variant="collage" />
      );
      const sources = [...container.querySelectorAll('img')].map(({ src }) => src);
      unmount();
      return sources;
    };
    const sources = sourcesForSeed('page-a');

    expect(sources).toHaveLength(5);
    expect(new Set(sources).size).toBe(5);
    expect(sources.every((src) => src.includes('/editor-'))).toBeTruthy();
    expect(sourcesForSeed('page-a')).toEqual(sources);
    expect(sourcesForSeed('page-b')).not.toEqual(sources);
  });

  it('uses a fanned stack and shows the number of additional images', () => {
    const { container } = render(<PostArtwork post={post(6)} seed="stack-seed" variant="stack" />);

    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('falls back to featured media when the editor has no images', () => {
    const { container } = render(
      <PostArtwork post={post(0)} seed="fallback-seed" variant="collage" />
    );

    expect(container.querySelector('img')?.src).toBe(
      'https://storage.googleapis.com/wonderboymusic/posts/featured-640.jpg'
    );
  });
});
