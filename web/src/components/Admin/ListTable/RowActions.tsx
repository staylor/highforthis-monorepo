import cn from 'classnames';
import type { ChangeEvent } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmit } from 'react-router';

import Link from '~/components/Link';

export interface RowAction {
  ids?: string[];
  label?: string;
  type: 'edit' | 'view' | 'delete';
  url: string;
}

export default function RowActions({ actions }: { actions: RowAction[] }) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const lastIndex = actions.length - 1;
  const linkClass = cn('hover:underline');
  return (
    <nav className="text-sm">
      {actions.map((action, i) => {
        const { type, url, label, ...props } = action;
        let elem;
        switch (type) {
          case 'edit':
            elem = (
              <Link className={linkClass} to={url}>
                {label || t('table.edit')}
              </Link>
            );
            break;
          case 'view':
            elem = (
              <a className={linkClass} href={url} target="_blank" rel="noreferrer">
                {label || t('table.view')}
              </a>
            );
            break;
          case 'delete':
            elem = (
              <form
                method="delete"
                className="inline"
                onSubmit={(e: ChangeEvent<HTMLFormElement>) => {
                  e.preventDefault();

                  submit(e.currentTarget, { method: 'delete' });
                }}
              >
                {action.ids?.map((id: string) => (
                  <input key={id} type="hidden" name="ids" value={id} />
                ))}
                <button type="submit" className={cn(linkClass, 'text-pink')} {...props}>
                  {label || t('table.delete')}
                </button>
              </form>
            );
            break;
          default:
            elem = null;
            break;
        }

        return (
          <Fragment key={`${type}-${url}`}>
            {elem}
            {i < lastIndex && ' | '}
          </Fragment>
        );
      })}
    </nav>
  );
}
