import { css, type Handle, type RemixNode } from 'remix/component';

import { colorTransition, lg, sm, text } from '#/ui/public/styles.ts';

import { getAdmin } from './context.tsx';
import { adminHref, adminNav, isSectionActive, type NavSection } from './nav.ts';
import { Icon } from './public/icon.tsx';
import { NavCollapse } from './public/nav-collapse.tsx';

// A sidebar on wide screens and a menu under the header on narrow ones. The menu is a
// <details> element, so it opens without JavaScript. On wide screens the sidebar collapses to a
// rail of icons (NavCollapse), where a section's pages open beside it on hover or focus.

/** While the wide-screen sidebar is collapsed: `data-nav="collapsed"` on <html>. */
const collapsed = ':where(html[data-nav="collapsed"]) &';
const railWidth = '4rem';
const sidebarWidth = '16rem';
const widthTransition = { transitionDuration: '200ms', transitionTimingFunction: 'var(--ease)' };

// Hidden but still read out, as a collapsed rail's labels are
const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

const borderColor = { borderColor: 'oklch(92.2% 0 none / 0.8)' };

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
  '&[aria-current="page"]': {
    backgroundColor: 'rgb(229 0 130 / 0.1)',
    color: 'var(--pink)',
    '&:visited': { color: 'var(--pink)' },
  },
  [lg]: { [collapsed]: { justifyContent: 'center', paddingInline: 0 } },
});

// A section's label, which the collapsed rail hides
const label = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  [lg]: { [collapsed]: srOnly },
});

// The sign-out button, looking like the links around it
const sectionButton = css({
  boxSizing: 'border-box',
  width: '100%',
  cursor: 'pointer',
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontFamily: 'inherit',
});

// A page within the current section
const pageLink = css({
  display: 'block',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.5rem',
  ...text.sm,
  textDecoration: 'none',
  color: 'var(--neutral-500)',
  '&:hover': { color: 'var(--neutral-900)' },
  '&[aria-current="page"]': { fontWeight: 600, color: 'var(--neutral-900)' },
});

// A section and its pages (data-section marks it for the pages' flyout)
const sectionItem = css({ position: 'relative' });

// A section's pages, under it while it's the current section. In the collapsed rail they open
// beside any section that's hovered or holds focus. Every rule is in this one style: each css()
// style is its own cascade layer, so a parent's style couldn't override `display` here.
const pageList = css({
  display: 'none',
  flexDirection: 'column',
  gap: '0.125rem',
  marginBlock: '0.125rem 0.25rem',
  marginLeft: '2.5rem',
  '&[data-current]': { display: 'flex' },
  [lg]: {
    [collapsed]: {
      '&[data-current]': { display: 'none' },
      // As specific as the rule above and after it, so a hovered current section opens too
      ':where([data-section]:hover, [data-section]:focus-within) > &[class]': {
        position: 'absolute',
        top: 0,
        left: '100%',
        zIndex: 50,
        display: 'flex',
        marginBlock: 0,
        marginLeft: '0.5rem',
        minWidth: '11rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        ...borderColor,
        backgroundColor: '#fff',
        padding: '0.5rem',
        boxShadow: 'var(--shadow-xl)',
      },
    },
  },
});

// The section's name at the top of its pages, shown only in the collapsed rail's flyout
const flyoutTitle = css({
  display: 'none',
  padding: '0.25rem 0.5rem 0.5rem',
  ...text.xs,
  fontWeight: 600,
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
  color: 'var(--neutral-900)',
  [lg]: { [collapsed]: { display: 'block' } },
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
          <span mix={label}>{t(section.label)}</span>
        </a>
      );
    }

    const href = adminHref(section.path);
    if (section.signOut) {
      return (
        <form method="post" action={href} data-rmx-document>
          <button type="submit" mix={[sectionLink, sectionButton]}>
            <Icon name={section.icon} size="1.25rem" />
            <span mix={label}>{t(section.label)}</span>
          </button>
        </form>
      );
    }
    return (
      <div mix={sectionItem} data-section>
        <a href={href} aria-current={active ? 'page' : undefined} mix={sectionLink}>
          <Icon name={section.icon} size="1.25rem" />
          <span mix={label}>{t(section.label)}</span>
        </a>
        {section.pages ? (
          <ul mix={pageList} data-current={active ? '' : undefined}>
            <li mix={flyoutTitle} aria-hidden="true">
              {t(section.label)}
            </li>
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
        ) : null}
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
          flexGrow: 1,
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          padding: '0.75rem 0.5rem',
          // The rail's flyouts reach past its edge
          [lg]: { [collapsed]: { overflowY: 'visible' } },
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

// The site's title, or its first letter in a pink square on the collapsed rail
const brandInitial = css({
  display: 'none',
  width: '1.75rem',
  height: '1.75rem',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--pink)',
  ...text.sm,
  fontFamily: 'var(--font-body)',
  fontWeight: 900,
  color: '#fff',
  [lg]: { [collapsed]: { display: 'flex' } },
});

function Brand(handle: Handle) {
  return () => {
    const { t } = getAdmin(handle);
    const title = t('title');
    return (
      <a
        href="/admin"
        aria-label={title}
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
        })}
      >
        <span mix={css({ [lg]: { [collapsed]: { display: 'none' } } })}>{title}</span>
        <span mix={brandInitial} aria-hidden="true">
          {title.charAt(0)}
        </span>
      </a>
    );
  };
}

export function AdminShell(handle: Handle<{ children?: RemixNode }>) {
  return () => {
    const { t } = getAdmin(handle);
    return (
      <div mix={css({ minHeight: '100vh', backgroundColor: '#fff' })}>
        <aside
          mix={css({
            position: 'fixed',
            insetBlock: 0,
            left: 0,
            zIndex: 40,
            display: 'none',
            width: sidebarWidth,
            flexDirection: 'column',
            borderRight: '1px solid',
            ...borderColor,
            backgroundColor: '#fff',
            transitionProperty: 'width',
            ...widthTransition,
            [lg]: { display: 'flex', [collapsed]: { width: railWidth } },
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
              [lg]: { [collapsed]: { justifyContent: 'center', paddingInline: 0 } },
            })}
          >
            <Brand />
          </div>
          <NavList />
          <div
            mix={css({ flexShrink: 0, borderTop: '1px solid', ...borderColor, padding: '0.5rem' })}
          >
            <NavCollapse collapseLabel={t('nav.collapse')} expandLabel={t('nav.expand')} />
          </div>
        </aside>
        <div
          mix={css({
            transitionProperty: 'margin-left',
            ...widthTransition,
            [lg]: { marginLeft: sidebarWidth, [collapsed]: { marginLeft: railWidth } },
          })}
        >
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
                <Icon name="menu" size="1.5rem" mix={css({ color: 'var(--neutral-700)' })} />
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
  };
}
