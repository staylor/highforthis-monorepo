import lexical from 'lexical';
import type { LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import type { ReactNode } from 'react';

import VideoComponent from '@/components/Videos/Video';
import type { Video } from '@/types/graphql';

const { $applyNodeReplacement, DecoratorNode } = lexical;

// this data gets saved
export type SerializedVideoNode = Spread<{ videoId: string }, SerializedLexicalNode>;

// this data gets sent by GraphQL
type SerializedVideoInput = Spread<{ video: Video }, SerializedLexicalNode>;

export default class VideoNode extends DecoratorNode<ReactNode> {
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
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    if (this.__video) {
      return <VideoComponent video={this.__video} embed />;
    }
    return null;
  }
}

export function $createVideoNode(video: Video): VideoNode {
  return $applyNodeReplacement(new VideoNode(video));
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}
