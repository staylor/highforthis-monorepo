import type { Handle, RemixNode } from 'remix/component';

import { formatDate } from '../shows/utils.ts';

import { getAdmin } from './context.tsx';
import { documentLoad } from './links.ts';

export function PageLink(handle: Handle<{ href: string; children?: RemixNode }>) {
  return () => (
    <a
      href={handle.props.href}
      target="_blank"
      rel="noreferrer"
      class="mx-4 inline-block text-sm text-pink underline"
    >
      {handle.props.children}
    </a>
  );
}

interface EntityShow {
  id: string;
  date?: number | null;
  /** Who played, or where, whichever the page isn't about. */
  name: string;
}

const SHOWN = 10;

/**
 * An artist's or venue's shows, newest first, each linking to its edit page. The first ten
 * show, and the rest are under "Show More", a <details> element, so it opens without JavaScript.
 */
export function EntityShows(handle: Handle<{ shows: EntityShow[] }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { shows } = handle.props;
    const item = (show: EntityShow) => {
      const date = formatDate(show.date ?? undefined);
      const href = `/admin/show/${show.id}`;
      return (
        <li class="my-3">
          <a href={href} data-rmx-document={documentLoad(href)} class="text-pink underline">
            {date.formatted}/{date.year} {show.name}
          </a>
        </li>
      );
    };
    const addHref = '/admin/show/add';
    return (
      <>
        <ul>{shows.slice(0, SHOWN).map(item)}</ul>
        {shows.length > SHOWN && (
          <details>
            <summary class="cursor-pointer text-sm underline">{t('entity.showMore')}</summary>
            <ul>{shows.slice(SHOWN).map(item)}</ul>
          </details>
        )}
        <a
          href={addHref}
          data-rmx-document={documentLoad(addHref)}
          class="mt-8 inline-block underline"
        >
          {t('shows.add')}
        </a>
      </>
    );
  };
}
