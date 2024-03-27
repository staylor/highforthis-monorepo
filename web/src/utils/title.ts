import { SITE_TITLE, SITE_TAGLINE } from '@/constants';
import type { SiteSettings } from '@/types/graphql';

export interface TitleProps {
  title?: string;
  siteSettings?: SiteSettings;
}

const titleTemplate = (data: TitleProps) => {
  const { siteSettings, title } = data || {};
  const template = `%s » ${siteSettings?.siteTitle || SITE_TITLE}`;
  if (!title) {
    return template.replace('%s', siteSettings?.tagline || SITE_TAGLINE);
  }
  return template.replace('%s', title);
};

export default titleTemplate;
