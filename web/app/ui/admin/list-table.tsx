import type { Handle, RemixNode } from 'remix/component';

import { PER_PAGE } from '@highforthis/shared/admin/listVariables';

import { cn } from '../public/cn.ts';

import { getAdmin } from './context.tsx';
import { documentLoad } from './links.ts';
import { Message } from './message.tsx';
import { buttonClass, inputBase } from './public/styles.ts';

// Works as plain HTML: each row's checkbox belongs to the bulk actions form through the `form`
// attribute, search is a GET form, and paging is links.

interface Column {
  label?: string;
  class?: string;
  render: (node: any) => RemixNode;
}

interface Connection {
  count: number;
  edges: { node: { id: string } }[];
  pageInfo: { hasNextPage?: boolean | null };
}

const BULK_FORM = 'bulk-actions';
const cellHeading = 'text-sm py-2 px-2.5 text-left';

export function RowTitle(handle: Handle<{ href: string; title?: string | null }>) {
  return () => {
    const { t } = getAdmin(handle);
    return (
      <strong class="mb-1 block text-sm font-bold wrap-break-word">
        <a href={handle.props.href}>{handle.props.title || t('table.noTitle')}</a>
      </strong>
    );
  };
}

/** Delete posts the row's ID with intent=delete. */
export function RowActions(handle: Handle<{ editHref: string; viewHref?: string; id: string }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { viewHref } = handle.props;
    return (
      <nav class="text-sm">
        <a class="hover:underline" href={handle.props.editHref}>
          {t('table.edit')}
        </a>
        {' | '}
        {viewHref && (
          <>
            <a class="hover:underline" href={viewHref} data-rmx-document={documentLoad(viewHref)}>
              {t('table.view')}
            </a>
            {' | '}
          </>
        )}
        <form method="post" class="inline">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="ids" value={handle.props.id} />
          <button type="submit" class="cursor-pointer text-pink hover:underline">
            {t('table.delete')}
          </button>
        </form>
      </nav>
    );
  };
}

/** The search box above a list: a GET form, so searching starts again from the first page. */
export function Search(handle: Handle<{ placeholder: string }>) {
  return () => {
    const { url } = getAdmin(handle);
    return (
      <form method="get" class="mb-2 w-full sm:float-right sm:w-64">
        <input
          type="search"
          name="search"
          value={url.searchParams.get('search') ?? ''}
          placeholder={handle.props.placeholder}
          aria-label={handle.props.placeholder}
          class={cn(inputBase, 'w-full')}
        />
      </form>
    );
  };
}

const pageText = cn(
  'border border-detail',
  'inline-block text-base leading-none font-normal mx-0.5 pt-0.5 px-1.5 pb-1 rounded-sm text-center select-none'
);

function Pagination(handle: Handle<{ connection: Connection; perPage: number; class?: string }>) {
  return () => {
    const { t, url } = getAdmin(handle);
    const { connection, perPage } = handle.props;
    const pages = connection.count > 0 ? Math.ceil(connection.count / perPage) : 0;
    const firstPage = pages === 0 ? 0 : 1;
    const page = url.searchParams.get('page');
    const currentPage = page ? Number(page) : firstPage;
    const paginated = currentPage > 1;
    const previousPage = paginated ? Math.max(currentPage - 1, 1) : null;
    const nextPage =
      currentPage !== pages && connection.pageInfo.hasNextPage ? currentPage + 1 : null;

    const href = (to: number) => {
      const params = new URLSearchParams(url.searchParams);
      if (to > 1) {
        params.set('page', String(to));
      } else {
        params.delete('page');
      }
      const query = params.toString();
      return query ? `${url.pathname}?${query}` : url.pathname;
    };
    const step = (to: number | null, label: string) =>
      to === null ? (
        <span class={cn(pageText, 'bg-neutral-50')}>{label}</span>
      ) : (
        <a
          href={href(to)}
          class={cn(pageText, 'text-dark hover:bg-detail bg-white no-underline hover:text-black')}
        >
          {label}
        </a>
      );
    const count = (text: string) => (
      <strong class="mx-1 inline-block px-2 text-center font-normal select-none">{text}</strong>
    );

    return (
      <nav class={cn('text-sm select-none', handle.props.class)}>
        {count(t('pagination.items', { count: connection.count }))}
        {step(paginated ? 1 : null, '«')}
        {step(previousPage, '‹')}
        {count(t('pagination.pages', { page: paginated ? currentPage : firstPage, pages }))}
        {step(nextPage, '›')}
        {step(currentPage !== pages ? pages : null, '»')}
      </nav>
    );
  };
}

interface ListTableProps {
  connection?: Connection | null;
  columns: Column[];
  deletable?: boolean;
  perPage?: number;
}

export function ListTable(handle: Handle<ListTableProps>) {
  return () => {
    const { t, url } = getAdmin(handle);
    const { connection, columns, deletable = true, perPage = PER_PAGE } = handle.props;
    const deleteFailed = Number(url.searchParams.get('deleteFailed') || 0);
    const failedMessage =
      deleteFailed > 0 ? (
        <Message param="deleteFailed" text={t('table.deleteFailed', { count: deleteFailed })} />
      ) : null;

    if (!connection?.edges.length) {
      return (
        <>
          {failedMessage}
          <p class="my-10">{t('table.noItems')}</p>
        </>
      );
    }

    const headerRow = (border: string) => (
      <tr>
        <th class={cn(cellHeading, 'w-9', border)}></th>
        {columns.map((column) => (
          <th class={cn(cellHeading, border, column.class)}>{column.label}</th>
        ))}
      </tr>
    );

    return (
      <>
        {failedMessage}
        <section class="clear-both my-1.5 flex flex-wrap items-center gap-2">
          <div class="flex grow flex-wrap items-center gap-2">
            {deletable && (
              // The chosen action is the form's intent, so Apply with none chosen does nothing
              <form id={BULK_FORM} method="post" class="flex items-center gap-2">
                <select
                  name="intent"
                  aria-label={t('table.bulkActions')}
                  class={cn(
                    inputBase,
                    'h-9 rounded-lg border-neutral-300 bg-white py-0 pr-9 text-sm'
                  )}
                >
                  <option value="">{t('table.bulkActions')}</option>
                  <option value="delete">{t('table.delete')}</option>
                </select>
                <button type="submit" class={buttonClass()}>
                  {t('table.apply')}
                </button>
              </form>
            )}
          </div>
          <Pagination connection={connection} perPage={perPage} class="text-right" />
        </section>
        {/* horizontal scroll instead of unreadable columns on narrow screens */}
        <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table class="w-full min-w-160 table-fixed border-spacing-0 border border-detail shadow-sm">
            <thead>{headerRow('border-b border-detail')}</thead>
            <tbody>
              {connection.edges.map(({ node }) => (
                <tr class="even:bg-neutral-50">
                  <th class={cn(cellHeading, 'px-2.5 py-1.5 align-top')}>
                    {deletable && (
                      <input
                        type="checkbox"
                        name="ids"
                        value={node.id}
                        form={BULK_FORM}
                        aria-label={t('table.select')}
                        class="rounded border-gray-300 text-pink focus:ring-pink-200"
                      />
                    )}
                  </th>
                  {columns.map((column) => (
                    <td class={cn('px-2.5 py-2 align-top text-sm wrap-break-word', column.class)}>
                      {column.render(node)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>{headerRow('border-t border-detail')}</tfoot>
          </table>
        </div>
        <section class="my-4 flex justify-end">
          <Pagination connection={connection} perPage={perPage} />
        </section>
      </>
    );
  };
}
