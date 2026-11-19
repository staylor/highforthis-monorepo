import { isServedByWeb } from '@highforthis/shared/adminPaths';

/**
 * For a link's `data-rmx-document`: links to admin pages that haven't moved here load in full.
 * Remix's client navigation would fetch the admin app's page and merge it into this document,
 * which can't run its scripts.
 */
export const documentLoad = (href: string) => !isServedByWeb(href) || undefined;
