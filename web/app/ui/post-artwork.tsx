import { gql } from 'graphql-tag';
import type { Handle } from 'remix/component';

import { uploadUrl } from '../lib/media.ts';
import type { PostArtwork_PostFragment } from '../types/graphql.ts';

import { cn } from './public/cn.ts';

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

const collageItemClasses = {
  1: [''],
  2: ['', ''],
  3: ['row-span-2', '', ''],
  4: ['', '', '', ''],
  5: ['col-span-2 row-span-2', 'col-span-2', 'col-span-2', 'col-span-2', 'col-span-2'],
} as const;

const stackItemClasses = [
  'z-30 -rotate-2 group-hover:-translate-x-1 group-hover:-rotate-6',
  'z-20 translate-x-1 rotate-6 group-hover:translate-x-2 group-hover:rotate-10',
  'z-10 translate-x-2 rotate-12 group-hover:translate-x-4 group-hover:rotate-16',
];

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

function Collage(images: DisplayImage[], className?: string) {
  const visibleImages = images.slice(0, 5);
  const count = visibleImages.length as keyof typeof collageItemClasses;

  return (
    <div
      class={cn(
        'grid gap-1 bg-neutral-950 size-full',
        count === 2 && 'grid-cols-2',
        count === 3 && 'grid-cols-2 grid-rows-2',
        count === 4 && 'grid-cols-2 grid-rows-2',
        count === 5 && 'grid-cols-6 grid-rows-2',
        className
      )}
    >
      {visibleImages.map(({ id, src }, index) => (
        <div key={id} class={cn('overflow-hidden', collageItemClasses[count][index])}>
          <img
            alt=""
            class="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={index === 0 ? 'eager' : 'lazy'}
            src={src}
          />
        </div>
      ))}
    </div>
  );
}

function Stack(images: DisplayImage[], className?: string) {
  const visibleImages = images.slice(0, 3);

  if (visibleImages.length === 1) {
    return (
      <div class={cn('shrink-0 overflow-hidden rounded-lg size-28', className)}>
        <img
          alt=""
          class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          src={visibleImages[0].src}
        />
      </div>
    );
  }

  return (
    <div class={cn('relative shrink-0 size-28', className)}>
      {visibleImages.map(({ id, src }, index) => (
        <img
          key={id}
          alt=""
          class={cn(
            'dark:border-surface-dark-card absolute inset-2 rounded-lg border-2 border-white object-cover shadow-md size-24',
            'transition-transform duration-500 ease-out',
            stackItemClasses[index]
          )}
          loading="lazy"
          src={src}
        />
      ))}
      {images.length > visibleImages.length && (
        <span class="absolute right-0 bottom-0 z-40 rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          +{images.length - visibleImages.length}
        </span>
      )}
    </div>
  );
}

export function PostArtwork(
  handle: Handle<{
    class?: string;
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
    return variant === 'collage'
      ? Collage(images, handle.props.class)
      : Stack(images, handle.props.class);
  };
}
