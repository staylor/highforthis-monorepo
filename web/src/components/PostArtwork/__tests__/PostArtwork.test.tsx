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
  it('builds a collage from the first five unique editor images', () => {
    const data = post(6);
    data.editorState?.root?.children?.push(data.editorState.root.children[0]);
    const { container } = render(<PostArtwork post={data} variant="collage" />);
    const images = [...container.querySelectorAll('img')];

    expect(images).toHaveLength(5);
    expect(images.map(({ src }) => src)).toEqual(
      Array.from(
        { length: 5 },
        (_, index) =>
          `https://storage.googleapis.com/wonderboymusic/posts/editor-${index + 1}-640.jpg`
      )
    );
  });

  it('uses a fanned stack and shows the number of additional images', () => {
    const { container } = render(<PostArtwork post={post(6)} variant="stack" />);

    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('falls back to featured media when the editor has no images', () => {
    const { container } = render(<PostArtwork post={post(0)} variant="collage" />);

    expect(container.querySelector('img')?.src).toBe(
      'https://storage.googleapis.com/wonderboymusic/posts/featured-640.jpg'
    );
  });
});
