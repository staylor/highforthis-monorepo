import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import type { RedirectResult } from '@highforthis/shared/admin/forms';

import { getAdminT, type TFunction } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import type { PostEditQuery, PostsAdminQuery } from '../../../types/graphql.ts';
import { AdminForm, FormField, type Field } from '../../../ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '../../../ui/admin/list-table.tsx';
import { Message } from '../../../ui/admin/message.tsx';
import { HeaderAdd, Heading } from '../../../ui/admin/page.tsx';
import { DateTimeInput } from '../../../ui/admin/public/date-time-input.tsx';
import { PostEditor } from '../../../ui/admin/public/editor/post-editor.tsx';
import { FeaturedMedia } from '../../../ui/admin/public/featured-media.tsx';
import { HeadingField } from '../../../ui/admin/public/heading-field.tsx';
import { buttonClass } from '../../../ui/admin/public/styles.ts';
import { TagsInput } from '../../../ui/admin/public/tags-input.tsx';
import { selectedMedia } from '../media/data.ts';
import { renderAdminPage } from '../render-page.tsx';

import { createPost, deletePosts, loadPost, loadPosts, updatePost } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const posts = routes.admin.posts;

type PostRow = NonNullable<PostsAdminQuery['posts']>['edges'][number]['node'];
type Post = NonNullable<PostEditQuery['post']>;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

const pad = (n: number) => String(n).padStart(2, '0');

function postDate(timestamp?: number | null) {
  if (!timestamp) {
    return null;
  }
  const d = new Date(timestamp);
  const hours = d.getHours();
  const time = `${hours % 12 || 12}:${pad(d.getMinutes())}${hours < 12 ? 'am' : 'pm'}`;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} at ${time}`;
}

const titleClass =
  'm-0 mb-2.5 block border-0 p-0 text-4xl leading-tight font-black tracking-wide wrap-break-word shadow-none lg:mb-6 lg:text-5xl focus:ring-0';

function bodyFields(t: TFunction, post?: Post): Field[] {
  return [
    {
      label: '',
      prop: 'title',
      type: 'custom',
      render: () => (
        <HeadingField
          name="title"
          value={post?.title ?? ''}
          placeholder={t('posts.addTitle')}
          class={titleClass}
        />
      ),
    },
    {
      label: '',
      prop: 'editorState',
      type: 'custom',
      render: () => (
        <PostEditor
          editorState={post?.editorState ? JSON.stringify(post.editorState) : ''}
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

function info(t: TFunction, post?: Post) {
  const fields: Field[] = [
    {
      label: t('posts.publishDate'),
      prop: 'date',
      type: 'custom',
      render: () => <DateTimeInput name="date" value={post?.date ?? null} id="field-date" />,
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
          class={buttonClass(false, 'my-4')}
        >
          {t('posts.view')}
        </a>
      )}
      {fields.map((field) => (
        <FormField field={field} data={post} />
      ))}
    </>
  );
}

function meta(t: TFunction, post?: Post) {
  const fields: Field[] = [
    {
      label: t('posts.featuredMedia'),
      prop: 'featuredMedia',
      type: 'custom',
      render: () => (
        <FeaturedMedia
          name="featuredMedia"
          type="image"
          media={selectedMedia(post?.featuredMedia)}
          buttonText={t('entity.setFeaturedMedia')}
          heading={t('media.heading')}
          closeLabel={t('admin.close')}
          loadingText={t('admin.loading')}
        />
      ),
    },
    { label: t('posts.summary'), prop: 'summary', type: 'textarea' },
    {
      label: t('posts.artists'),
      prop: 'artists',
      type: 'custom',
      render: () => (
        <TagsInput
          name="artists"
          tags={(post?.artists ?? []).filter(Boolean).map((artist) => artist!.name)}
          placeholder={t('tags.placeholder')}
          removeLabel={t('tags.remove', { tag: '{{tag}}' })}
        />
      ),
    },
  ];
  return fields.map((field) => <FormField field={field} data={post} />);
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
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
      const columns = [
        {
          label: t('posts.title'),
          render: (post: PostRow) => {
            const href = posts.edit.index.href({ id: post.id });
            const draft = post.status === 'DRAFT' ? ` - ${t('posts.status.draft')}` : '';
            return (
              <>
                <RowTitle href={href} title={`${post.title}${draft}`} />
                <RowActions
                  editHref={href}
                  viewHref={routes.post.href({ slug: post.slug })}
                  id={post.id}
                />
              </>
            );
          },
        },
        { label: t('posts.slug'), render: (post: PostRow) => post.slug },
        { label: t('posts.date'), render: (post: PostRow) => postDate(post.date) },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('posts.heading')}</Heading>
          <HeaderAdd href={posts.add.index.href()} label={t('posts.add')} />
          {deleted > 0 && <Message param="deleted" text={t('posts.deleted', { count: deleted })} />}
          <Search placeholder={t('posts.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('posts.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete. Apply with no action chosen posts an
    // empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      if (formData.get('intent') !== 'delete') {
        return createRedirectResponse(`${context.url.pathname}${context.url.search}`, 303);
      }
      return backTo(await deletePosts({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const postsAdd = createController(posts.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      const t = getAdminT();
      const label = t('posts.add');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <Message text={t('posts.updated')} />
          <AdminForm fields={bodyFields(t)} buttonLabel={label} info={info(t)} meta={meta(t)} />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(await createPost({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const postsEdit = createController(posts.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { post } = await loadPost({ gql: context.admin.gql, id: context.params.id });
      if (!post) {
        return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
      }
      const label = t('posts.edit');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <Message text={t('posts.updated')} />
          <AdminForm
            fields={bodyFields(t, post)}
            data={post}
            buttonLabel={t('posts.update')}
            info={info(t, post)}
            meta={meta(t, post)}
          />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updatePost({
          gql: context.admin.gql,
          id: context.params.id,
          formData,
          url: context.url,
        })
      );
    },
  },
});
