import cn from 'classnames';
import { gql } from 'graphql-tag';

import { Heading } from '@/components/Admin/styles';
import Button from '@/components/Button';
import Message from '@/components/Form/Message';
import Form from '@/components/Admin/Form';
import Tags from '@/components/Admin/Form/Tags';
import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import type { Fields } from '@/types';
import type { Artist, Post } from '@/types/graphql';
import Video from '@/components/Videos/Video';
import TextNodes from '@/components/Post/TextNodes';

interface PostFormProps {
  data?: Post;
  heading: string;
  buttonLabel: string;
}

export default function PostForm({ data = {} as Post, heading, buttonLabel }: PostFormProps) {
  const postFields: Fields = [
    {
      prop: 'slug',
      type: 'custom',
      render: (post: Post) => {
        if (!post.slug) {
          return null;
        }

        const url = `/post/${post.slug}`;
        return (
          <Button href={url} target="_blank" rel="noreferrer">
            View Post
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
      placeholder: 'Add a Title',
    },
    {
      prop: 'editorState',
      type: 'editor',
    },
    {
      label: 'Featured Media',
      prop: 'featuredMedia',
      type: 'custom',
      render: (p: Post) => <FeaturedMedia media={p.featuredMedia || []} />,
      position: 'meta',
    },
    {
      label: 'Summary',
      prop: 'summary',
      type: 'textarea',
      position: 'meta',
    },
    {
      label: 'Artists',
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
      label: 'Publish Date',
      prop: 'date',
      type: 'date',
      position: 'info',
    },
    {
      label: 'Status',
      prop: 'status',
      type: 'select',
      choices: [
        { label: 'Publish', value: 'PUBLISH' },
        { label: 'Draft', value: 'DRAFT' },
      ],
      position: 'info',
    },
  ];
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text="Post updated." />
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
