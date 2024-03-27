import type { ImageUpload, SiteSettings } from '@/types/graphql';
import { uploadUrl } from '@/utils/media';
import titleTemplate from '@/utils/title';

interface MetaTags {
  title: string;
  description: string;
  url: string;
  image: ImageUpload;
  siteSettings: SiteSettings;
}

export const metaTags = ({ title, description, url, image, siteSettings }: MetaTags) => {
  const featuredImage = uploadUrl(image.destination, image.fileName);

  return [
    { title: titleTemplate({ title: title, siteSettings }) },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: featuredImage },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:url', content: url },
    { property: 'twitter:image', content: featuredImage },
  ];
};
