import type { Handle, RemixNode } from 'remix/component';

import { cn } from '../public/cn.ts';

import { getAdmin } from './context.tsx';
import { Icon } from './icon.tsx';
import { documentLoad } from './links.ts';
import { adminHref, adminNav, isSectionActive, type NavSection } from './nav.ts';

// A sidebar on wide screens and a menu under the header on narrow ones. The menu is a
// <details> element, so it opens without JavaScript.

const linkBase = cn(
  'flex items-center gap-3 rounded-lg py-2 pr-2 pl-2.5 text-sm font-medium no-underline',
  'transition-colors duration-150 outline-none focus-visible:ring-pink/50 focus-visible:ring-2'
);
const linkActive = 'bg-pink/10 text-pink visited:text-pink dark:bg-pink/15';
const linkIdle = cn(
  'text-neutral-600 visited:text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  'dark:text-neutral-400 dark:visited:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white'
);

function SectionLink(handle: Handle<{ section: NavSection }>) {
  return () => {
    const { t, url, siteUrl } = getAdmin(handle);
    const { section } = handle.props;
    const active = isSectionActive(section, url.pathname);

    if (section.site) {
      return (
        <a href={siteUrl} target="_blank" rel="noreferrer" class={cn(linkBase, linkIdle)}>
          <Icon name={section.icon} class="size-5" />
          <span class="truncate">{t(section.label)}</span>
        </a>
      );
    }

    const href = adminHref(section.path);
    return (
      <div>
        <a
          href={href}
          aria-current={active ? 'page' : undefined}
          data-rmx-document={documentLoad(href)}
          class={cn(linkBase, active ? linkActive : linkIdle)}
        >
          <Icon name={section.icon} class="size-5" />
          <span class="truncate">{t(section.label)}</span>
        </a>
        {active && section.pages && (
          <ul class="mt-0.5 mb-1 ml-10 flex flex-col gap-0.5">
            {section.pages.map((page) => {
              const pageHref = adminHref(page.path);
              const current = url.pathname === pageHref;
              return (
                <li>
                  <a
                    href={pageHref}
                    aria-current={current ? 'page' : undefined}
                    data-rmx-document={documentLoad(pageHref)}
                    class={cn(
                      'block rounded-md px-2 py-1 text-sm no-underline',
                      current
                        ? 'font-semibold text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    )}
                  >
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

function NavList(handle: Handle) {
  return () => {
    const { t } = getAdmin(handle);
    return (
      <nav aria-label={t('nav.menu')} class="flex flex-col gap-1 overflow-y-auto px-2 py-3">
        {adminNav.map((group, i) => (
          <div
            class={cn(
              'flex flex-col gap-0.5',
              i > 0 && 'mt-2 border-t border-neutral-200/80 pt-2 dark:border-white/10'
            )}
          >
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
        data-rmx-document={documentLoad('/admin')}
        class="truncate font-title text-2xl tracking-tight text-neutral-900 uppercase no-underline hover:text-pink dark:text-white"
      >
        {t('title')}
      </a>
    );
  };
}

const borderClass = 'border-neutral-200/80 dark:border-white/10';

export function AdminShell(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div class="min-h-screen bg-white dark:bg-surface-dark">
      <aside
        class={cn(
          'fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-white lg:flex',
          'dark:bg-surface-dark-elevated',
          borderClass
        )}
      >
        <div class={cn('flex h-14 shrink-0 items-center border-b px-3', borderClass)}>
          <Brand />
        </div>
        <NavList />
      </aside>
      <div class="lg:ml-64">
        <header
          class={cn(
            'sticky top-0 z-30 border-b bg-white/90 backdrop-blur-xl lg:hidden',
            'dark:bg-surface-dark/90',
            borderClass
          )}
        >
          <details>
            <summary
              class={cn(
                'flex h-14 cursor-pointer list-none items-center gap-2 px-3',
                '[&::-webkit-details-marker]:hidden'
              )}
            >
              <Icon name="menu" class="size-6 text-neutral-700 dark:text-neutral-200" />
              <Brand />
            </summary>
            <div class={cn('max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t', borderClass)}>
              <NavList />
            </div>
          </details>
        </header>
        <main class="relative z-20 px-4 pt-6 pb-16 sm:px-6 lg:px-8">{handle.props.children}</main>
      </div>
    </div>
  );
}
