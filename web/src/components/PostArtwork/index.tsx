import cn from 'classnames';
import { gql } from 'graphql-tag';

import type { PostArtwork_PostFragment } from '#/types/graphql';
import { uploadUrl } from '#/utils/media';

interface ArtworkImage {
  crops: { fileName: string; width: number }[];
  destination: string;
  id: string;
}

interface DisplayImage extends ArtworkImage {
  src: string;
}

interface PostArtworkProps {
  className?: string;
  post: PostArtwork_PostFragment;
  variant: 'collage' | 'stack';
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

function postImages(post: PostArtwork_PostFragment, targetWidth: number) {
  const editorImages =
    post.editorState?.root?.children?.flatMap((node) => {
      if (node && 'image' in node && node.image) {
        return [node.image];
      }
      return [];
    }) || [];

  const featuredImages =
    post.featuredMedia?.flatMap((media) => ('crops' in media ? [media] : [])) || [];

  const uniqueEditorImages = [...new Map(editorImages.map((image) => [image.id, image])).values()];
  const images = displayImages(uniqueEditorImages, targetWidth);

  return images.length > 0 ? images : displayImages(featuredImages, targetWidth);
}

function Collage({ className, images }: { className?: string; images: DisplayImage[] }) {
  const visibleImages = images.slice(0, 5);
  const count = visibleImages.length as keyof typeof collageItemClasses;

  return (
    <div
      className={cn(
        'grid h-full w-full gap-1 bg-neutral-950',
        count === 2 && 'grid-cols-2',
        count === 3 && 'grid-cols-2 grid-rows-2',
        count === 4 && 'grid-cols-2 grid-rows-2',
        count === 5 && 'grid-cols-6 grid-rows-2',
        className
      )}
    >
      {visibleImages.map(({ id, src }, index) => (
        <div key={id} className={cn('overflow-hidden', collageItemClasses[count][index])}>
          <img
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={index === 0 ? 'eager' : 'lazy'}
            src={src}
          />
        </div>
      ))}
    </div>
  );
}

function Stack({ className, images }: { className?: string; images: DisplayImage[] }) {
  const visibleImages = images.slice(0, 3);

  if (visibleImages.length === 1) {
    return (
      <div className={cn('h-28 w-28 shrink-0 overflow-hidden rounded-lg', className)}>
        <img
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          src={visibleImages[0].src}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative h-28 w-28 shrink-0', className)}>
      {visibleImages.map(({ id, src }, index) => (
        <img
          key={id}
          alt=""
          className={cn(
            'dark:border-surface-dark-card absolute inset-2 h-24 w-24 rounded-lg border-2 border-white object-cover shadow-md',
            'transition-transform duration-500 ease-out',
            stackItemClasses[index]
          )}
          loading="lazy"
          src={src}
        />
      ))}
      {images.length > visibleImages.length && (
        <span className="bg-pink absolute right-0 bottom-0 z-40 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          +{images.length - visibleImages.length}
        </span>
      )}
    </div>
  );
}

export default function PostArtwork({ className, post, variant }: PostArtworkProps) {
  const images = postImages(post, variant === 'collage' ? 640 : 300);

  if (images.length === 0) {
    return null;
  }

  return variant === 'collage' ? (
    <Collage className={className} images={images} />
  ) : (
    <Stack className={className} images={images} />
  );
}

PostArtwork.fragments = {
  post: gql`
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
  `,
};
