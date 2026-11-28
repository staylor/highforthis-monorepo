import { css } from 'remix/component';
import { createController } from 'remix/router';

import { mediaField } from '#/actions/admin/media/field.tsx';
import {
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminEditContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import { dateTime } from '#/lib/admin/date-time.ts';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { PostEditQuery, PostsAdminQuery } from '#/types/graphql.ts';
import { AdminForm, FormField, type Field } from '#/ui/admin/form.tsx';
import { ListTable, Search, TitleCell } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { DateTimeInput } from '#/ui/admin/public/date-time-input.tsx';
import { PostEditor } from '#/ui/admin/public/editor/post-editor.tsx';
import { HeadingField } from '#/ui/admin/public/heading-field.tsx';
import { button } from '#/ui/admin/public/styles.ts';
import { TagsInput } from '#/ui/admin/public/tags-input.tsx';
import { merge } from '#/ui/public/styles.ts';

import { createPost, deletePosts, loadPost, loadPosts, updatePost } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const posts = routes.admin.posts;

type PostRow = NonNullable<PostsAdminQuery['posts']>['edges'][number]['node'];
type Post = NonNullable<PostEditQuery['post']>;
// What a save that failed submitted, which the form shows in place of what's saved
type Values = SaveFailure['values'];

function bodyFields(t: TFunction, post?: Post, values?: Values): Field[] {
  return [
    {
      label: '',
      prop: 'title',
      type: 'custom',
      render: () => (
        <HeadingField
          name="title"
          value={values?.title ?? post?.title ?? ''}
          placeholder={t('posts.addTitle')}
        />
      ),
    },
    {
      label: '',
      prop: 'editorState',
      type: 'custom',
      render: () => (
        <PostEditor
          editorState={post?.editorState?.forEditing ?? ''}
          labels={{
            placeholder: t('editor.placeholder'),
            blockTypes: t('editor.blockTypes'),
            media: t('media.heading'),
            videos: t('videos.heading'),
            close: t('admin.close'),
            loading: t('admin.loading'),
          }}
        />
      ),
    },
  ];
}

function info(t: TFunction, post?: Post, values?: Values) {
  const date = values?.date ? Number(values.date) : (post?.date ?? null);
  const fields: Field[] = [
    {
      label: t('posts.publishDate'),
      prop: 'date',
      type: 'custom',
      render: () => (
        <DateTimeInput name="date" value={date} id="field-date" hint={t('admin.newYorkTime')} />
      ),
    },
    {
      label: t('posts.status.label'),
      prop: 'status',
      type: 'select',
      choices: [
        { label: t('posts.status.publish'), value: 'PUBLISH' },
        { label: t('posts.status.draft'), value: 'DRAFT' },
      ],
    },
  ];
  return (
    <>
      {post?.slug && (
        <a
          href={routes.post.href({ slug: post.slug })}
          target="_blank"
          rel="noreferrer"
          mix={css(merge(button(), { marginBlock: '1rem' }))}
        >
          {t('posts.view')}
        </a>
      )}
      {fields.map((field) => (
        <FormField field={field} data={post} values={values} />
      ))}
    </>
  );
}

function meta(t: TFunction, post?: Post, values?: Values) {
  // The tags as submitted: one is a string, several are a list, and none isn't there
  const tags = values
    ? [values.artists ?? []].flat()
    : (post?.artists ?? []).filter(Boolean).map((artist) => artist!.name);
  const fields: Field[] = [
    mediaField({
      label: t('posts.featuredMedia'),
      prop: 'featuredMedia',
      media: post?.featuredMedia,
      buttonText: t('entity.setFeaturedMedia'),
    }),
    { label: t('posts.summary'), prop: 'summary', type: 'textarea' },
    {
      label: t('posts.artists'),
      prop: 'artists',
      type: 'custom',
      render: () => (
        <TagsInput
          name="artists"
          tags={tags}
          placeholder={t('tags.placeholder')}
          removeLabel={t('tags.remove', { tag: '{{tag}}' })}
        />
      ),
    },
  ];
  return fields.map((field) => <FormField field={field} data={post} values={values} />);
}

function addPage(context: AdminPageContext, failure?: SaveFailure) {
  const t = getAdminT();
  const label = t('posts.add');
  const values = failure?.values;
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <AdminForm
        fields={bodyFields(t, undefined, values)}
        failure={failure}
        buttonLabel={label}
        info={info(t, undefined, values)}
        meta={meta(t, undefined, values)}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { post } = await loadPost({ gql: context.admin.gql, id: context.params.id });
  if (!post) {
    return renderAdminNotFound(context);
  }
  const label = t('posts.edit');
  const values = failure?.values;
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <Message text={t('posts.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={bodyFields(t, post, values)}
        data={post}
        failure={failure}
        buttonLabel={t('posts.update')}
        info={info(t, post, values)}
        meta={meta(t, post, values)}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const postsList = createController(posts.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { posts: connection } = await loadPosts({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const columns = [
        {
          label: t('posts.title'),
          render: (post: PostRow) => {
            const draft = post.status === 'DRAFT' ? ` - ${t('posts.status.draft')}` : '';
            return (
              <TitleCell
                href={posts.edit.index.href({ id: post.id })}
                title={`${post.title}${draft}`}
                viewHref={routes.post.href({ slug: post.slug })}
                id={post.id}
              />
            );
          },
        },
        { label: t('posts.slug'), render: (post: PostRow) => post.slug },
        { label: t('posts.date'), render: (post: PostRow) => post.date && dateTime(post.date) },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('posts.heading')}</Heading>
          <HeaderAdd href={posts.add.index.href()} label={t('posts.add')} />
          <Message param="deleted" text={(count) => t('posts.deleted', { count })} />
          <Search placeholder={t('posts.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('posts.heading') }
      );
    },

    action: listAction(deletePosts),
  },
});

export const postsAdd = createController(posts.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(addPage, createPost),
});

export const postsEdit = createController(posts.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updatePost),
});
