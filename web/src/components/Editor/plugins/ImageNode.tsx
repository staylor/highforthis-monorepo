import lexical from 'lexical';
import type { LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import type { ReactNode } from 'react';

import ImageComponent from '@/components/Editor/Blocks/Image';
import type { ImageUpload } from '@/types/graphql';

const { $applyNodeReplacement, DecoratorNode } = lexical;

// this data gets saved
export type SerializedImageNode = Spread<{ imageId: string; size: string }, SerializedLexicalNode>;

// this data gets sent by GraphQL
type SerializedImageInput = Spread<{ image: ImageUpload; size: string }, SerializedLexicalNode>;

export default class ImageNode extends DecoratorNode<ReactNode> {
  __image: ImageUpload;
  __size: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__image, node.__size, node.__key);
  }

  static importJSON(serializedNode: SerializedImageInput): ImageNode {
    const { image, size } = serializedNode;
    return $createImageNode(image, size);
  }

  exportJSON(): SerializedImageNode {
    return {
      imageId: this.__image.id,
      size: this.__size,
      type: 'image',
      version: 1,
    };
  }

  constructor(image: ImageUpload, size: string, key?: NodeKey) {
    super(key);
    this.__image = image;
    this.__size = size;
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return <ImageComponent image={this.__image} size={this.__size} />;
  }
}

export function $createImageNode(image: ImageUpload, size: string): ImageNode {
  return $applyNodeReplacement(new ImageNode(image, size));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
