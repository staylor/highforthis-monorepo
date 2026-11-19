// An image, a video and a saved post, for the editor's tests.
import type { SerializedEditorState } from 'lexical';

import type { ImageUpload, Video } from '../../../../types/graphql.ts';

// an image and a video with the fields the editor and its pickers read
export const image = {
  id: 'image-1',
  destination: '2024/03',
  crops: [
    { fileName: 'album-640x0.jpg', width: 640 },
    { fileName: 'album-150x150.jpg', width: 150 },
  ],
} as ImageUpload;

export const video = {
  id: 'video-1',
  dataId: 'youtube-1',
  slug: 'a-video',
  title: 'A video',
  thumbnails: [
    { height: 90, url: 'https://example.com/thumbnail-120.jpg', width: 120 },
    { height: 360, url: 'https://example.com/thumbnail-640.jpg', width: 640 },
  ],
} as Video;

const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
});

const block = { direction: 'ltr', format: '', indent: 0, version: 1 };

// a saved post as GraphQL sends it: its images and videos carry their data, not just their ids
export const savedPost = {
  root: {
    ...block,
    type: 'root',
    children: [
      { ...block, type: 'heading', tag: 'h3', children: [text('Best albums')] },
      { type: 'image', version: 1, image, size: 'FEATURE' },
      { ...block, type: 'paragraph', children: [text('Key tracks:', 1), text(' all of them')] },
      { type: 'video', version: 1, video },
      {
        ...block,
        type: 'list',
        listType: 'bullet',
        start: 1,
        tag: 'ul',
        children: [{ ...block, type: 'listitem', value: 1, children: [text('One')] }],
      },
    ],
  },
} as unknown as SerializedEditorState;

// what the post save reads back for the image and the video
export const savedImage = { imageId: image.id, size: 'FEATURE', type: 'image', version: 1 };
export const savedVideo = { videoId: video.id, type: 'video', version: 1 };
