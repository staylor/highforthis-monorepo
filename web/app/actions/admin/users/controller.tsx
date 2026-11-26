import { createController } from 'remix/router';

import {
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminEditContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { User } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, Search, TitleCell } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';

import { createUser, deleteUsers, loadUser, loadUsers, updateUser } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const users = routes.admin.users;

function userFields(): Field[] {
  const t = getAdminT();
  return [
    { label: t('users.name'), prop: 'name' },
    {
      label: t('users.email'),
      prop: 'email',
      inputType: 'email',
      required: true,
      autoComplete: false,
    },
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
      const columns = [
        {
          label: t('users.name'),
          render: (user: User) => (
            <TitleCell
              href={users.edit.index.href({ id: user.id })}
              title={user.name}
              id={user.id}
            />
          ),
        },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('users.heading')}</Heading>
          <HeaderAdd href={users.add.index.href()} label={t('users.add')} />
          <Message param="deleted" text={(count) => t('users.deleted', { count })} />
          <Search placeholder={t('users.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('users.heading') }
      );
    },

    action: listAction(deleteUsers),
  },
});

function addPage(context: AdminPageContext, failure?: SaveFailure) {
  const t = getAdminT();
  const label = t('users.add');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <AdminForm fields={userFields()} failure={failure} buttonLabel={label} />
    </>,
    { title: label, status: failure?.status }
  );
}

export const usersAdd = createController(users.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(addPage, createUser),
});

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { user } = await loadUser({ gql: context.admin.gql, id: context.params.id });
  if (!user) {
    return renderAdminNotFound(context);
  }
  return renderAdminPage(
    context,
    <>
      <Heading>{t('users.edit')}</Heading>
      <Message text={t('users.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={userFields()}
        data={user}
        failure={failure}
        buttonLabel={t('users.update')}
      />
    </>,
    { title: t('users.edit'), status: failure?.status }
  );
}

export const usersEdit = createController(users.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updateUser),
});
