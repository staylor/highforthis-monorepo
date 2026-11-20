import { css, type Handle, type RemixNode } from 'remix/component';

import { PER_PAGE } from '#/lib/admin/list-variables.ts';
import { merge, sm, text, type Styles } from '#/ui/public/styles.ts';

import { getAdmin } from './context.tsx';
import { documentLoad } from './links.ts';
import { Message } from './message.tsx';
import { AutoSubmitSelect } from './public/auto-submit-select.tsx';
import { SelectAll } from './public/select-all.tsx';
import { button, table, tableScroller, toolbarSelect, wideInput } from './public/styles.ts';

// Works as plain HTML: each row's checkbox belongs to the bulk actions form through the `form`
// attribute, search is a GET form, and paging is links.

interface Column {
  label?: string;
  /** Styles for the column's cells, such as its width. */
  styles?: Styles;
  render: (node: any) => RemixNode;
}

interface Connection {
  count?: number | null;
  edges: { node: { id: string } }[];
  pageInfo: { hasNextPage?: boolean | null };
}

const BULK_FORM = 'bulk-actions';
const cell = { padding: '0.5rem 0.625rem', ...text.sm, textAlign: 'left' } satisfies Styles;
const plainButton = css(button());
const underlineOnHover = css({ '&:hover': { textDecoration: 'underline' } });
const toolbar = {
  clear: 'both',
  marginBlock: '0.375rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
} satisfies Styles;
const row = css({ display: 'flex', alignItems: 'center', gap: '0.5rem' });

export function RowTitle(
  handle: Handle<{ href: string; title?: string | null; subtitle?: string | null }>
) {
  return () => {
    const { t } = getAdmin(handle);
    const { href, title, subtitle } = handle.props;
    return (
      <strong
        mix={css({
          marginBottom: '0.25rem',
          display: 'block',
          ...text.sm,
          fontWeight: 700,
          overflowWrap: 'break-word',
        })}
      >
        <a href={href}>{title || t('table.noTitle')}</a>
        {subtitle && (
          <>
            <br />
            <span mix={css({ ...text.xs, fontWeight: 400 })}>{subtitle}</span>
          </>
        )}
      </strong>
    );
  };
}

/**
 * Given the row's ID, a delete button that posts it with intent=delete. A column about
 * something else, such as a show's venue, leaves the ID out.
 */
export function RowActions(handle: Handle<{ editHref: string; viewHref?: string; id?: string }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { editHref, viewHref, id } = handle.props;
    const actions: RemixNode[] = [
      <a mix={underlineOnHover} href={editHref} data-rmx-document={documentLoad(editHref)}>
        {t('table.edit')}
      </a>,
    ];
    if (viewHref) {
      actions.push(
        <a mix={underlineOnHover} href={viewHref} data-rmx-document={documentLoad(viewHref)}>
          {t('table.view')}
        </a>
      );
    }
    if (id) {
      actions.push(
        <form method="post" mix={css({ display: 'inline' })}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="ids" value={id} />
          <button
            type="submit"
            mix={css({
              cursor: 'pointer',
              color: 'var(--pink)',
              '&:hover': { textDecoration: 'underline' },
            })}
          >
            {t('table.delete')}
          </button>
        </form>
      );
    }
    return (
      <nav mix={css(text.sm)}>
        {actions.flatMap((action, i) => (i === 0 ? [action] : [' | ', action]))}
      </nav>
    );
  };
}

// What a list's GET forms leave out when they keep the page's other query parameters: the page
// number, since a new search or filter starts again from the first page, and the messages a
// redirect showed.
const notKept = new Set(['page', 'deleted', 'deleteFailed', 'message', 'saveFailed']);

/** Hidden inputs for the page's query parameters other than `name`, so a GET form keeps them. */
function KeptParams(handle: Handle<{ name: string }>) {
  return () => {
    const { url } = getAdmin(handle);
    return [...url.searchParams]
      .filter(([key]) => key !== handle.props.name && !notKept.has(key))
      .map(([key, value]) => <input type="hidden" name={key} value={value} />);
  };
}

/**
 * The search box above a list: a GET form, so searching starts again from the first page. It
 * keeps the list's filters.
 */
export function Search(handle: Handle<{ placeholder: string }>) {
  return () => {
    const { url } = getAdmin(handle);
    return (
      <form
        method="get"
        mix={css({
          marginBottom: '0.5rem',
          width: '100%',
          [sm]: { float: 'right', width: '16rem' },
        })}
      >
        <KeptParams name="search" />
        <input
          type="search"
          name="search"
          value={url.searchParams.get('search') ?? ''}
          placeholder={handle.props.placeholder}
          aria-label={handle.props.placeholder}
          mix={wideInput}
        />
      </form>
    );
  };
}

interface ListFilterProps {
  /** The query parameter it sets, such as `year`. */
  name: string;
  /** The empty choice, which removes the filter. */
  placeholder: string;
  choices: { label: string; value: string }[];
}

/**
 * A filter beside a list's bulk actions, such as the videos' year: a GET form that keeps the
 * search and starts again from the first page. It submits as soon as it changes, or with Apply
 * without JavaScript.
 */
export function ListFilter(handle: Handle<ListFilterProps>) {
  return () => {
    const { t, url } = getAdmin(handle);
    const { name, placeholder, choices } = handle.props;
    return (
      <form method="get" mix={row}>
        <KeptParams name={name} />
        <AutoSubmitSelect
          name={name}
          value={url.searchParams.get(name) ?? ''}
          placeholder={placeholder}
          choices={choices}
        />
        <noscript>
          <button type="submit" mix={plainButton}>
            {t('table.apply')}
          </button>
        </noscript>
      </form>
    );
  };
}

const pageStep = {
  marginInline: '0.125rem',
  display: 'inline-block',
  borderRadius: '0.25rem',
  border: '1px solid var(--detail)',
  padding: '0.125rem 0.375rem 0.25rem',
  fontSize: '1rem',
  lineHeight: 1,
  fontWeight: 400,
  textAlign: 'center',
  userSelect: 'none',
} satisfies Styles;

const disabledStep = css({ ...pageStep, backgroundColor: 'var(--neutral-50)' });

const linkStep = css({
  ...pageStep,
  backgroundColor: '#fff',
  color: 'var(--dark)',
  textDecoration: 'none',
  '&:hover': { backgroundColor: 'var(--detail)', color: '#000' },
});

const pageCount = css({
  marginInline: '0.25rem',
  display: 'inline-block',
  paddingInline: '0.5rem',
  textAlign: 'center',
  fontWeight: 400,
  userSelect: 'none',
});

function Pagination(handle: Handle<{ connection: Connection; perPage: number; top?: boolean }>) {
  return () => {
    const { t, url } = getAdmin(handle);
    const { connection, perPage } = handle.props;
    const total = connection.count ?? 0;
    const pages = total > 0 ? Math.ceil(total / perPage) : 0;
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
        <span mix={disabledStep}>{label}</span>
      ) : (
        <a href={href(to)} mix={linkStep}>
          {label}
        </a>
      );
    const count = (text: string) => <strong mix={pageCount}>{text}</strong>;

    return (
      <nav
        mix={css({
          ...text.sm,
          userSelect: 'none',
          textAlign: handle.props.top ? 'right' : undefined,
        })}
      >
        {count(t('pagination.items', { count: total }))}
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
  filters?: RemixNode;
  perPage?: number;
}

const rowCheckbox = css({
  borderRadius: '0.25rem',
  borderColor: 'var(--gray-300)',
  color: 'var(--pink)',
  '&:focus': { boxShadow: '0 0 0 2px #fff, 0 0 0 4px var(--pink-200)' },
});

export function ListTable(handle: Handle<ListTableProps>) {
  return () => {
    const { t, url } = getAdmin(handle);
    const { connection, columns, deletable = true, filters, perPage = PER_PAGE } = handle.props;
    const deleteFailed = Number(url.searchParams.get('deleteFailed') || 0);
    const failedMessage =
      deleteFailed > 0 ? (
        <Message param="deleteFailed" text={t('table.deleteFailed', { count: deleteFailed })} />
      ) : null;

    if (!connection?.edges.length) {
      // The filters stay, so a filter that matches nothing can be changed
      return (
        <>
          {failedMessage}
          {filters && <section mix={css(toolbar)}>{filters}</section>}
          <p mix={css({ marginBlock: '2.5rem' })}>{t('table.noItems')}</p>
        </>
      );
    }

    // The column labels, above the rows and again below them, each with a box that selects every
    // row. They take a column's width but stay left-aligned.
    const headerRow = (border: Styles) => (
      <tr>
        <th mix={css({ ...cell, width: '2.25rem', ...border })}>
          {deletable ? <SelectAll label={t('table.selectAll')} /> : null}
        </th>
        {columns.map((column) => (
          <th mix={css(merge(column.styles, cell, border))}>{column.label}</th>
        ))}
      </tr>
    );

    return (
      <>
        {failedMessage}
        <section mix={css({ ...toolbar, alignItems: 'center' })}>
          <div
            mix={css({
              display: 'flex',
              flexGrow: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
            })}
          >
            {deletable && (
              // The chosen action is the form's intent, so Apply with none chosen does nothing
              <form id={BULK_FORM} method="post" mix={row}>
                <select name="intent" aria-label={t('table.bulkActions')} mix={css(toolbarSelect)}>
                  <option value="">{t('table.bulkActions')}</option>
                  <option value="delete">{t('table.delete')}</option>
                </select>
                <button type="submit" mix={plainButton}>
                  {t('table.apply')}
                </button>
              </form>
            )}
            {filters}
          </div>
          <Pagination connection={connection} perPage={perPage} top />
        </section>
        {/* horizontal scroll instead of unreadable columns on narrow screens */}
        <div mix={tableScroller}>
          <table mix={table}>
            <thead>{headerRow({ borderBottom: '1px solid var(--detail)' })}</thead>
            <tbody>
              {connection.edges.map(({ node }) => (
                <tr mix={css({ '&:nth-child(even)': { backgroundColor: 'var(--neutral-50)' } })}>
                  <th mix={css({ ...cell, verticalAlign: 'top' })}>
                    {deletable && (
                      <input
                        type="checkbox"
                        name="ids"
                        value={node.id}
                        form={BULK_FORM}
                        aria-label={t('table.select')}
                        mix={rowCheckbox}
                      />
                    )}
                  </th>
                  {columns.map((column) => (
                    <td
                      mix={css(
                        merge(
                          {
                            padding: '0.5rem 0.625rem',
                            verticalAlign: 'top',
                            ...text.sm,
                            overflowWrap: 'break-word',
                          },
                          column.styles
                        )
                      )}
                    >
                      {column.render(node)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>{headerRow({ borderTop: '1px solid var(--detail)' })}</tfoot>
          </table>
        </div>
        <section mix={css({ marginBlock: '1rem', display: 'flex', justifyContent: 'flex-end' })}>
          <Pagination connection={connection} perPage={perPage} />
        </section>
      </>
    );
  };
}
