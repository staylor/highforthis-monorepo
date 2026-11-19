import { css, type Handle, type RemixNode } from 'remix/component';

import { colorTransition, dark, lg, sm, text } from '../public/styles.ts';

import { getAdmin } from './context.tsx';
import { adminHref, adminNav, isSectionActive, type NavSection } from './nav.ts';
import { Icon } from './public/icon.tsx';

// A sidebar on wide screens and a menu under the header on narrow ones. The menu is a
// <details> element, so it opens without JavaScript.

const borderColor = {
  borderColor: 'oklch(92.2% 0 none / 0.8)',
  [dark]: { borderColor: 'rgb(255 255 255 / 0.1)' },
};

// A section's link, pink while it's the current section
const sectionLink = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.5rem 0.5rem 0.625rem',
  ...text.sm,
  fontWeight: 500,
  textDecoration: 'none',
  ...colorTransition,
  outline: 'none',
  '&:focus-visible': { boxShadow: '0 0 0 2px rgb(229 0 130 / 0.5)' },
  color: 'var(--neutral-600)',
  '&:visited': { color: 'var(--neutral-600)' },
  '&:hover': { backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-900)' },
  [dark]: {
    color: 'var(--neutral-400)',
    '&:visited': { color: 'var(--neutral-400)' },
    '&:hover': { backgroundColor: 'rgb(255 255 255 / 0.05)', color: '#fff' },
  },
  '&[aria-current="page"]': {
    backgroundColor: 'rgb(229 0 130 / 0.1)',
    color: 'var(--pink)',
    '&:visited': { color: 'var(--pink)' },
    [dark]: { backgroundColor: 'rgb(229 0 130 / 0.15)' },
  },
});

const truncate = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });

// A page within the current section
const pageLink = css({
  display: 'block',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.5rem',
  ...text.sm,
  textDecoration: 'none',
  color: 'var(--neutral-500)',
  '&:hover': { color: 'var(--neutral-900)' },
  [dark]: { color: 'var(--neutral-400)', '&:hover': { color: '#fff' } },
  '&[aria-current="page"]': {
    fontWeight: 600,
    color: 'var(--neutral-900)',
    [dark]: { color: '#fff' },
  },
});

function SectionLink(handle: Handle<{ section: NavSection }>) {
  return () => {
    const { t, url, siteUrl } = getAdmin(handle);
    const { section } = handle.props;
    const active = isSectionActive(section, url.pathname);

    if (section.site) {
      return (
        <a href={siteUrl} target="_blank" rel="noreferrer" mix={sectionLink}>
          <Icon name={section.icon} size="1.25rem" />
          <span mix={truncate}>{t(section.label)}</span>
        </a>
      );
    }

    const href = adminHref(section.path);
    return (
      <div>
        <a
          href={href}
          aria-current={active ? 'page' : undefined}
          data-rmx-document={section.fullLoad || undefined}
          mix={sectionLink}
        >
          <Icon name={section.icon} size="1.25rem" />
          <span mix={truncate}>{t(section.label)}</span>
        </a>
        {active && section.pages && (
          <ul
            mix={css({
              marginBlock: '0.125rem 0.25rem',
              marginLeft: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
            })}
          >
            {section.pages.map((page) => {
              const pageHref = adminHref(page.path);
              const current = url.pathname === pageHref;
              return (
                <li>
                  <a href={pageHref} aria-current={current ? 'page' : undefined} mix={pageLink}>
                    {t(page.label)}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };
}

// The groups of sections, with a line between them
const navGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  '& + &': { marginTop: '0.5rem', borderTop: '1px solid', ...borderColor, paddingTop: '0.5rem' },
});

function NavList(handle: Handle) {
  return () => {
    const { t } = getAdmin(handle);
    return (
      <nav
        aria-label={t('nav.menu')}
        mix={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          padding: '0.75rem 0.5rem',
        })}
      >
        {adminNav.map((group) => (
          <div mix={navGroup}>
            {group.map((section) => (
              <SectionLink section={section} />
            ))}
          </div>
        ))}
      </nav>
    );
  };
}

function Brand(handle: Handle) {
  return () => {
    const { t } = getAdmin(handle);
    return (
      <a
        href="/admin"
        mix={css({
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-title)',
          ...text['2xl'],
          letterSpacing: '-0.025em',
          color: 'var(--neutral-900)',
          textTransform: 'uppercase',
          textDecoration: 'none',
          '&:hover': { color: 'var(--pink)' },
          [dark]: { color: '#fff' },
        })}
      >
        {t('title')}
      </a>
    );
  };
}

export function AdminShell(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div
      mix={css({
        minHeight: '100vh',
        backgroundColor: '#fff',
        [dark]: { backgroundColor: 'var(--surface-dark)' },
      })}
    >
      <aside
        mix={css({
          position: 'fixed',
          insetBlock: 0,
          left: 0,
          zIndex: 40,
          display: 'none',
          width: '16rem',
          flexDirection: 'column',
          borderRight: '1px solid',
          ...borderColor,
          backgroundColor: '#fff',
          [lg]: { display: 'flex' },
          [dark]: { ...borderColor[dark], backgroundColor: 'var(--surface-dark-elevated)' },
        })}
      >
        <div
          mix={css({
            display: 'flex',
            height: '3.5rem',
            flexShrink: 0,
            alignItems: 'center',
            borderBottom: '1px solid',
            ...borderColor,
            paddingInline: '0.75rem',
          })}
        >
          <Brand />
        </div>
        <NavList />
      </aside>
      <div mix={css({ [lg]: { marginLeft: '16rem' } })}>
        <header
          mix={css({
            position: 'sticky',
            top: 0,
            zIndex: 30,
            borderBottom: '1px solid',
            ...borderColor,
            backgroundColor: 'rgb(255 255 255 / 0.9)',
            backdropFilter: 'blur(24px)',
            [lg]: { display: 'none' },
            [dark]: { ...borderColor[dark], backgroundColor: 'rgb(10 10 10 / 0.9)' },
          })}
        >
          <details>
            <summary
              mix={css({
                display: 'flex',
                height: '3.5rem',
                cursor: 'pointer',
                listStyle: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                paddingInline: '0.75rem',
                '&::-webkit-details-marker': { display: 'none' },
              })}
            >
              <Icon
                name="menu"
                size="1.5rem"
                mix={css({ color: 'var(--neutral-700)', [dark]: { color: 'var(--neutral-200)' } })}
              />
              <Brand />
            </summary>
            <div
              mix={css({
                maxHeight: 'calc(100vh - 3.5rem)',
                overflowY: 'auto',
                borderTop: '1px solid',
                ...borderColor,
              })}
            >
              <NavList />
            </div>
          </details>
        </header>
        <main
          mix={css({
            position: 'relative',
            zIndex: 20,
            padding: '1.5rem 1rem 4rem',
            [sm]: { paddingInline: '1.5rem' },
            [lg]: { paddingInline: '2rem' },
          })}
        >
          {handle.props.children}
        </main>
      </div>
    </div>
  );
}
