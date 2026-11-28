import { css, type Handle, type RemixNode } from 'remix/component';

import { routes } from '#/routes.ts';
import { text } from '#/ui/public/styles.ts';
import { formatSchedule } from '#/ui/shows/utils.ts';

import { getAdmin } from './context.tsx';
import { documentLoad } from './links.ts';
import { label, pinkLink } from './public/styles.ts';

export function PageLink(handle: Handle<{ href: string; children?: RemixNode }>) {
  return () => (
    <a
      href={handle.props.href}
      target="_blank"
      rel="noreferrer"
      mix={css({
        marginInline: '1rem',
        display: 'inline-block',
        ...text.sm,
        color: 'var(--pink)',
        textDecoration: 'underline',
      })}
    >
      {handle.props.children}
    </a>
  );
}

interface EntityShow {
  id: string;
  schedule: { localDate: string };
  /** Who played, or where, whichever the page isn't about. */
  name: string;
}

const SHOWN = 10;

/**
 * An artist's or venue's shows under a "Shows" label, newest first, each linking to its edit
 * page. The first ten show, and the rest are under "Show More", a <details> element, so it opens
 * without JavaScript.
 */
export function EntityShows(handle: Handle<{ shows: EntityShow[] }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { shows } = handle.props;
    const item = (show: EntityShow) => {
      const date = formatSchedule(show.schedule);
      const href = routes.admin.shows.edit.index.href({ id: show.id });
      return (
        <li mix={css({ marginBlock: '0.75rem' })}>
          <a href={href} data-rmx-document={documentLoad(href)} mix={pinkLink}>
            {date.formatted}/{date.year} {show.name}
          </a>
        </li>
      );
    };
    const addHref = routes.admin.shows.add.index.href();
    return (
      <div mix={css({ marginBlock: '1.5rem', display: 'block' })}>
        <span mix={label}>{t('entity.shows')}</span>
        <ul>{shows.slice(0, SHOWN).map(item)}</ul>
        {shows.length > SHOWN && (
          <details>
            <summary mix={css({ cursor: 'pointer', ...text.sm, textDecoration: 'underline' })}>
              {t('entity.showMore')}
            </summary>
            <ul>{shows.slice(SHOWN).map(item)}</ul>
          </details>
        )}
        <a
          href={addHref}
          data-rmx-document={documentLoad(addHref)}
          mix={css({ marginTop: '2rem', display: 'inline-block', textDecoration: 'underline' })}
        >
          {t('shows.add')}
        </a>
      </div>
    );
  };
}
