import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

import type { Video, VideoThumbnail } from '../../../../types/graphql.ts';

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
  if (className) {
    el.className = className;
  }
  el.append(...children);
  return el;
}

function playIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
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

  const figure = element('figure', '');
  const thumb = findThumb(video.thumbnails);
  if (thumb) {
    const img = element('img', '');
    img.src = thumb.url;
    img.alt = video.title;
    figure.append(img);
  }
  const caption = element('figcaption', '', video.title);
  caption.hidden = true;
  figure.append(element('div', 'play', element('div', '', playIcon())), caption);

  const link = element('a', '', figure);
  link.href = href;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const iframe = element('iframe', '');
    iframe.src = `https://www.youtube.com/embed/${video.dataId}?autoplay=1`;
    link.replaceChildren(iframe);
  });

  const titleLink = element('a', '', video.title);
  titleLink.href = href;

  return [link, element('h3', '', titleLink)];
}

/**
 * A YouTube video in a post. It draws its own DOM in `createDOM`, so any UI framework (or none) can
 * host the editor; `decorate()` has nothing to render.
 */
export default class VideoNode extends DecoratorNode<null> {
  // A block of its own. Lexical wraps inline nodes at the root in a paragraph, which would change
  // how saved posts load.
  isInline(): false {
    return false;
  }

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
    div.className = 'editor-video';
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
