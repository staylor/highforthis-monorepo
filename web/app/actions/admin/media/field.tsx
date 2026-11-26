import { getAdminT } from '#/lib/i18n.ts';
import type { FeaturedMedia_MediaFragment } from '#/types/graphql.ts';
import type { Field } from '#/ui/admin/form.tsx';
import { FeaturedMedia } from '#/ui/admin/public/featured-media.tsx';

import { selectedMedia } from './data.ts';

type Upload = FeaturedMedia_MediaFragment | null | undefined;

interface MediaFieldOptions {
  label: string;
  /** The form field's name, and what the form's data calls it. */
  prop: string;
  /** The uploads it picks from. */
  type?: 'image' | 'audio';
  /** What's picked: an upload, or a list of them. */
  media: Upload | ReadonlyArray<Upload>;
  buttonText: string;
}

/** A form field that picks an upload from the library, such as a post's featured image. */
export function mediaField({
  label,
  prop,
  type = 'image',
  media,
  buttonText,
}: MediaFieldOptions): Field {
  const t = getAdminT();
  return {
    label,
    prop,
    type: 'custom',
    render: () => (
      <FeaturedMedia
        name={prop}
        type={type}
        media={selectedMedia([media].flat())}
        buttonText={buttonText}
        heading={t('media.heading')}
        closeLabel={t('admin.close')}
        loadingText={t('admin.loading')}
      />
    ),
  };
}
