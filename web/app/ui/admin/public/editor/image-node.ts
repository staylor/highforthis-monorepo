import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

import type { ImageUpload } from '../../../../types/graphql.ts';
import { uploadUrl } from '../../../public/media.ts';

// this data gets saved
type SerializedImageNode = Spread<{ imageId: string; size: string }, SerializedLexicalNode>;

// this data gets sent by GraphQL
type SerializedImageInput = Spread<{ image: ImageUpload; size: string }, SerializedLexicalNode>;

const cropWidths: Record<string, number> = {
  FEATURE: 640,
  MEDIUM: 300,
  THUMB: 150,
};

/** The image as the editor shows it: the crop for its size, or the first crop. */
function renderImage(image: ImageUpload | null, size: string) {
  if (!image) {
    return null;
  }

  // this logic is insufficient, it assumes all images are at least 640px,
  // else it goes down to the next size, which is probably too small
  // probably want to use the original size, but that might be too big
  const crop = image.crops.find((c) => c.width === cropWidths[size]) ?? image.crops[0];
  if (!crop) {
    return null;
  }

  const img = document.createElement('img');
  img.className = 'editor-image';
  img.alt = '';
  img.src = uploadUrl(image.destination, crop.fileName);
  return img;
}

/**
 * An image in a post. It draws its own DOM in `createDOM`, so any UI framework (or none) can host
 * the editor; `decorate()` has nothing to render.
 */
export default class ImageNode extends DecoratorNode<null> {
  // A block of its own. Lexical wraps inline nodes at the root in a paragraph, which would change
  // how saved posts load.
  isInline(): false {
    return false;
  }

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
    const element = document.createElement('div');
    const img = renderImage(this.__image, this.__size);
    if (img) {
      element.append(img);
    }
    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): null {
    return null;
  }
}

export function $createImageNode(image: ImageUpload, size: string): ImageNode {
  return $applyNodeReplacement(new ImageNode(image, size));
}
