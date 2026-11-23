import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import {
  renderAdminPage,
  type AdminContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import { isRedirect, type RedirectResult, type SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { User } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';

import { createUser, deleteUsers, loadUser, loadUsers, updateUser } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const users = routes.admin.users;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

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
  actions: {
    index: (context) => addPage(context),

    // Goes to the new user's page, or shows the form again with what was entered
    async action(context) {
      const formData = await context.request.formData();
      const result = await createUser({ gql: context.admin.gql, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : addPage(context, result);
    },
  },
});

async function editPage(context: AdminContext, id: string, failure?: SaveFailure) {
  const t = getAdminT();
  const { user } = await loadUser({ gql: context.admin.gql, id });
  if (!user) {
    return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
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
  actions: {
    index: (context) => editPage(context, context.params.id),

    async action(context) {
      const { id } = context.params;
      const formData = await context.request.formData();
      const result = await updateUser({ gql: context.admin.gql, id, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : editPage(context, id, result);
    },
  },
});
