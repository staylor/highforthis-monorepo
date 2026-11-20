import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { PostArtwork_PostFragment } from '#/types/graphql.ts';

import { uploadUrl } from './public/media.ts';
import { linkHover, merge, type Styles } from './public/styles.ts';

export const postArtworkFragment = gql`
  fragment PostArtwork_post on Post {
    editorState {
      root {
        children {
          ... on ImageNode {
            image {
              crops {
                fileName
                width
              }
              destination
              id
            }
          }
        }
      }
    }
    featuredMedia {
      destination
      id
      ... on ImageUpload {
        crops {
          fileName
          width
        }
      }
    }
  }
`;

interface ArtworkImage {
  crops: { fileName: string; width: number }[];
  destination: string;
  id: string;
}

interface DisplayImage extends ArtworkImage {
  src: string;
}

const span2 = 'span 2 / span 2';

// The grid for each number of images: three put the first image down the left, five put it
// in a large square beside four small ones
const collageGrids: Record<number, Styles> = {
  2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  3: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    '& > :first-child': { gridRow: span2 },
  },
  4: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
  },
  5: {
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    '& > *': { gridColumn: span2 },
    '& > :first-child': { gridRow: span2 },
  },
};

const collageItem = css({ overflow: 'hidden' });

const collageImage = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'scale 700ms var(--ease)',
  [linkHover]: { scale: 1.05 },
});

// The stacked images fan out when the card is hovered
const stackImages: Styles[] = [
  {
    zIndex: 30,
    rotate: '-2deg',
    [linkHover]: { translate: '-0.25rem 0', rotate: '-6deg' },
  },
  {
    zIndex: 20,
    translate: '0.25rem 0',
    rotate: '6deg',
    [linkHover]: { translate: '0.5rem 0', rotate: '10deg' },
  },
  {
    zIndex: 10,
    translate: '0.5rem 0',
    rotate: '12deg',
    [linkHover]: { translate: '1rem 0', rotate: '16deg' },
  },
];

const stackImage = {
  position: 'absolute',
  inset: '0.5rem',
  width: '6rem',
  height: '6rem',
  borderRadius: '0.5rem',
  border: '2px solid light-dark(#fff, var(--surface-dark-card))',
  objectFit: 'cover',
  boxShadow: 'var(--shadow-md)',
  transition: 'translate 500ms var(--ease-out), rotate 500ms var(--ease-out)',
} satisfies Styles;

const stackSize = {
  flexShrink: 0,
  width: '7rem',
  height: '7rem',
} satisfies Styles;

function cropUrl(image: ArtworkImage, targetWidth: number) {
  const crops = [...image.crops].sort((a, b) => a.width - b.width);
  const crop = crops.find(({ width }) => width >= targetWidth) || crops.at(-1);
  return crop ? uploadUrl(image.destination, crop.fileName) : undefined;
}

function displayImages(images: ArtworkImage[], targetWidth: number) {
  return images.flatMap((image) => {
    const src = cropUrl(image, targetWidth);
    return src ? [{ ...image, src }] : [];
  });
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomizeImages(images: DisplayImage[], seed: string) {
  return images.toSorted(
    (first, second) => hashString(`${seed}:${first.id}`) - hashString(`${seed}:${second.id}`)
  );
}

function postImages(post: PostArtwork_PostFragment, targetWidth: number, seed: string) {
  const editorImages =
    post.editorState?.root?.children?.flatMap((node) => {
      if (node && 'image' in node && node.image) {
        return [node.image];
      }
      return [];
    }) || [];

  const featuredImages =
    post.featuredMedia?.flatMap((media) => ('crops' in media ? [media as ArtworkImage] : [])) || [];

  const uniqueEditorImages = [...new Map(editorImages.map((image) => [image.id, image])).values()];
  const images = displayImages(uniqueEditorImages, targetWidth);
  const preferredImages = images.length > 0 ? images : displayImages(featuredImages, targetWidth);

  return randomizeImages(preferredImages, seed);
}

function Collage(images: DisplayImage[]) {
  const visibleImages = images.slice(0, 5);

  return (
    <div
      mix={css(
        merge(
          {
            display: 'grid',
            gap: '0.25rem',
            backgroundColor: 'var(--neutral-950)',
            width: '100%',
            height: '100%',
          },
          collageGrids[visibleImages.length]
        )
      )}
    >
      {visibleImages.map(({ id, src }, index) => (
        <div key={id} mix={collageItem}>
          <img alt="" mix={collageImage} loading={index === 0 ? 'eager' : 'lazy'} src={src} />
        </div>
      ))}
    </div>
  );
}

function Stack(images: DisplayImage[]) {
  const visibleImages = images.slice(0, 3);

  if (visibleImages.length === 1) {
    return (
      <div mix={css({ ...stackSize, overflow: 'hidden', borderRadius: '0.5rem' })}>
        <img
          alt=""
          mix={css({
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'scale 500ms var(--ease)',
            [linkHover]: { scale: 1.05 },
          })}
          loading="lazy"
          src={visibleImages[0].src}
        />
      </div>
    );
  }

  return (
    <div mix={css({ ...stackSize, position: 'relative' })}>
      {visibleImages.map(({ id, src }, index) => (
        <img
          key={id}
          alt=""
          mix={css(merge(stackImage, stackImages[index]))}
          loading="lazy"
          src={src}
        />
      ))}
      {images.length > visibleImages.length && (
        <span
          mix={css({
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 40,
            borderRadius: '9999px',
            backgroundColor: 'var(--pink)',
            padding: '0.125rem 0.375rem',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            boxShadow: 'var(--shadow-sm)',
          })}
        >
          +{images.length - visibleImages.length}
        </span>
      )}
    </div>
  );
}

export function PostArtwork(
  handle: Handle<{
    post: PostArtwork_PostFragment;
    seed: string;
    variant: 'collage' | 'stack';
  }>
) {
  return () => {
    const { post, seed, variant } = handle.props;
    const images = postImages(post, variant === 'collage' ? 640 : 300, seed);
    if (images.length === 0) {
      return null;
    }
    return variant === 'collage' ? Collage(images) : Stack(images);
  };
}
