import cn from 'classnames';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import Tags from '~/components/Admin/Form/Tags';
import { Heading } from '~/components/Admin/styles';
import Button from '~/components/Button';
import Message from '~/components/Form/Message';
import TextNodes from '~/components/Post/TextNodes';
import Video from '~/components/Videos/Video';
import type { Fields } from '~/types';
import type { Artist, Post } from '~/types/graphql';

interface PostFormProps {
  data?: Post;
  heading: string;
  buttonLabel: string;
}

export default function PostForm({ data = {} as Post, heading, buttonLabel }: PostFormProps) {
  const { t } = useTranslation();
  const postFields: Fields = [
    {
      prop: t('videos.slug'),
      type: 'custom',
      render: (post: Post) => {
        if (!post.slug) {
          return null;
        }

        const url = `/post/${post.slug}`;
        return (
          <Button href={url} target="_blank" rel="noreferrer">
            {t('posts.view')}
          </Button>
        );
      },
      position: 'info',
    },
    {
      prop: 'title',
      className: cn(
        'block font-stylized font-semibold tracking-wide mb-2.5 lg:mb-6 text-4xl lg:text-5xl m-0 p-0 shadow-none border-0 h-12'
      ),
      placeholder: t('posts.addTitle'),
    },
    {
      prop: 'editorState',
      type: 'editor',
    },
    {
      label: t('posts.featuredMedia'),
      prop: 'featuredMedia',
      type: 'custom',
      render: (p: Post) => <FeaturedMedia media={p.featuredMedia || []} />,
      position: 'meta',
    },
    {
      label: t('posts.summary'),
      prop: 'summary',
      type: 'textarea',
      position: 'meta',
    },
    {
      label: t('posts.artists'),
      prop: 'artists',
      type: 'custom',
      position: 'meta',
      render: ({ artists = [] }: Post) => {
        const tags = (
          artists ? artists.filter(Boolean).map((t) => (t as Artist).name) : []
        ) as string[];
        return <Tags tags={tags} name="artists" />;
      },
    },
    {
      label: t('posts.publishDate'),
      prop: 'date',
      type: 'date',
      position: 'info',
    },
    {
      label: t('posts.status.label'),
      prop: 'status',
      type: 'select',
      choices: [
        { label: t('posts.status.publish'), value: 'PUBLISH' },
        { label: t('posts.status.draft'), value: 'DRAFT' },
      ],
      position: 'info',
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text={t('posts.updated')} />
      <Form data={data} fields={postFields} buttonLabel={buttonLabel} />
    </>
  );
}

PostForm.fragments = {
  post: gql`
    fragment PostForm_post on Post {
      artists {
        id
        name
      }
      date
      editorState {
        root {
          children {
            ... on ElementNodeType {
              direction
              format
              indent
              type
              version
            }
            ... on HeadingNode {
              children {
                ...TextNodes_linebreakNode
                ...TextNodes_textNode
              }
              tag
            }
            ... on ImageNode {
              image {
                crops {
                  fileName
                  width
                }
                destination
                id
              }
            }
            ... on VideoNode {
              video {
                ...Video_video
              }
            }
            ... on ElementNode {
              children {
                ...TextNodes_linebreakNode
                ...TextNodes_textNode
              }
            }
          }
          direction
          format
          indent
          type
          version
        }
      }
      featuredMedia {
        ...FeaturedMedia_media
      }
      id
      slug
      status
      summary
      title
    }
    ${TextNodes.fragments.linebreakNode}
    ${TextNodes.fragments.textNode}
    ${FeaturedMedia.fragments.media}
    ${Video.fragments.video}
  `,
};
