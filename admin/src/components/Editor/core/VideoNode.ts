import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

import type { Video, VideoThumbnail } from '#/types/graphql';

// this data gets saved
type SerializedVideoNode = Spread<{ videoId: string }, SerializedLexicalNode>;

// this data gets sent by GraphQL
type SerializedVideoInput = Spread<{ video: Video }, SerializedLexicalNode>;

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  ...children: (Node | string)[]
) {
  const el = document.createElement(tag);
  el.className = className;
  el.append(...children);
  return el;
}

function playIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'ml-0.5 size-7 text-white');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M8 5v14l11-7z');
  svg.append(path);
  return svg;
}

const findThumb = (thumbs: VideoThumbnail[]) =>
  [640, 480, 320].map((width) => thumbs.find((t) => t.width === width)).find(Boolean);

/**
 * The video as the editor shows it, the same as on the site: its thumbnail, which plays the video
 * in place when clicked, and its title.
 */
function renderVideo(video: Video) {
  const href = `/video/${video.slug}`;

  const figure = element('figure', 'group/thumb relative overflow-hidden rounded-xl');
  const thumb = findThumb(video.thumbnails);
  if (thumb) {
    const img = element(
      'img',
      'aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105'
    );
    img.src = thumb.url;
    img.alt = video.title;
    figure.append(img);
  }
  figure.append(
    element(
      'div',
      'absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100',
      element(
        'div',
        'flex size-14 items-center justify-center rounded-full bg-pink/90 backdrop-blur-sm',
        playIcon()
      )
    ),
    element('figcaption', 'hidden', video.title)
  );

  const link = element('a', 'm-0 block', figure);
  link.href = href;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const iframe = element('iframe', 'w-full aspect-video');
    iframe.src = `https://www.youtube.com/embed/${video.dataId}?autoplay=1`;
    link.replaceChildren(iframe);
  });

  const titleLink = element('a', '', video.title);
  titleLink.href = href;

  return [link, element('h3', 'mb-6 text-base', titleLink)];
}

/**
 * A YouTube video in a post. It draws its own DOM in `createDOM`, so any UI framework (or none) can
 * host the editor; `decorate()` has nothing to render.
 */
export default class VideoNode extends DecoratorNode<null> {
  __video: Video;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__video, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoInput): VideoNode {
    const { video } = serializedNode;
    return $createVideoNode(video);
  }

  exportJSON(): SerializedVideoNode {
    return {
      videoId: this.__video.id,
      type: 'video',
      version: 1,
    };
  }

  constructor(video: Video, key?: NodeKey) {
    super(key);
    this.__video = video;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    if (this.__video) {
      div.append(...renderVideo(this.__video));
    }
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): null {
    return null;
  }
}

export function $createVideoNode(video: Video): VideoNode {
  return $applyNodeReplacement(new VideoNode(video));
}
