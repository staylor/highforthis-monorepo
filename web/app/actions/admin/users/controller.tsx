import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import type { RedirectResult } from '@highforthis/shared/admin/forms';

import { getAdminT } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import type { User } from '../../../types/graphql.ts';
import { AdminForm, type Field } from '../../../ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '../../../ui/admin/list-table.tsx';
import { Message } from '../../../ui/admin/message.tsx';
import { HeaderAdd, Heading } from '../../../ui/admin/page.tsx';
import { renderAdminPage } from '../render-page.tsx';

import { createUser, deleteUsers, loadUser, loadUsers, updateUser } from './data.ts';

// The admin's users section, moved from the admin app's routes/admin/user. Each form route has
// its own controller, since controller middleware doesn't apply to nested route maps.

const users = routes.admin.users;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

function userFields(): Field[] {
  const t = getAdminT();
  return [
    { label: t('users.name'), prop: 'name' },
    { label: t('users.email'), prop: 'email', inputType: 'email', autoComplete: false },
    { label: t('users.password'), prop: 'password', inputType: 'password', autoComplete: false },
    { label: t('users.bio'), prop: 'bio', type: 'textarea' },
    {
      label: t('users.roles.label'),
      prop: 'roles',
      type: 'select',
      choices: [
        { label: t('users.roles.admin'), value: 'admin' },
        { label: t('users.roles.editor'), value: 'editor' },
      ],
      multiple: true,
    },
  ];
}

export const usersList = createController(users.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { users: connection } = await loadUsers({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
      const columns = [
        {
          label: t('users.name'),
          render: (user: User) => {
            const href = users.edit.index.href({ id: user.id });
            return (
              <>
                <RowTitle href={href} title={user.name} />
                <RowActions editHref={href} id={user.id} />
              </>
            );
          },
        },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('users.heading')}</Heading>
          <HeaderAdd href={users.add.index.href()} label={t('users.add')} />
          {deleted > 0 && <Message param="deleted" text={t('users.deleted', { count: deleted })} />}
          <Search placeholder={t('users.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('users.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete; Apply with no action chosen posts an
    // empty intent and just comes back to the list
    async action(context) {
      const formData = await context.request.formData();
      if (formData.get('intent') !== 'delete') {
        return createRedirectResponse(`${context.url.pathname}${context.url.search}`, 303);
      }
      return backTo(await deleteUsers({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const usersAdd = createController(users.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      const t = getAdminT();
      const label = t('users.add');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <AdminForm fields={userFields()} buttonLabel={label} />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(await createUser({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const usersEdit = createController(users.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { user } = await loadUser({ gql: context.admin.gql, id: context.params.id });
      if (!user) {
        return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
      }
      return renderAdminPage(
        context,
        <>
          <Heading>{t('users.edit')}</Heading>
          <Message text={t('users.updated')} />
          <AdminForm fields={userFields()} data={user} buttonLabel={t('users.update')} />
        </>,
        { title: t('users.edit') }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updateUser({
          gql: context.admin.gql,
          id: context.params.id,
          formData,
          url: context.url,
        })
      );
    },
  },
});
