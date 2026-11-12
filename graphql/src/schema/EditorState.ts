const EditorState = `#graphql
  interface LexicalNode {
    type: String
    version: Int
  }

  interface ElementNodeType implements LexicalNode {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
  }

  enum ElementDirection {
    ltr
    rtl
  }

  enum HeadingTag {
    h1
    h2
    h3
    h4
    h5
    h6
  }

  enum ListType {
    bullet
    check
    number
  }

  enum TextModeType {
    normal
    token
    segmented
  }

  union EditorNode = ElementNode | CodeNode | HeadingNode | ImageNode | LinebreakNode | ListItemNode | ListNode | QuoteNode | TextNode | VideoNode

  type CodeNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    language: String
    type: String
    version: Int
  }

  type ElementNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
  }

  input ElementNodeInput {
    children: [EditorNodeInput]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
  }

  type HeadingNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    tag: HeadingTag
    type: String
    version: Int
  }

  type ImageNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    image: ImageUpload
    size: String
    type: String
    version: Int
  }

  type LinebreakNode implements LexicalNode {
    type: String
    version: Int
  }

  type ListItemNode implements LexicalNode & ElementNodeType {
    checked: Boolean
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    value: Int
    version: Int
  }

  type ListNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    listType: ListType
    start: Int
    type: String
    version: Int
  }

  type QuoteNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
  }

  type TextNode implements LexicalNode {
    detail: Int
    format: Int
    mode: TextModeType
    style: String
    text: String
    textFormat: Int
    textStyle: String
    type: String
    version: Int
  }

  type VideoNode implements LexicalNode & ElementNodeType {
    children: [EditorNode]
    direction: ElementDirection
    format: Int
    indent: Int
    video: Video
    type: String
    version: Int
  }

  input EditorNodeInput {
    children: [EditorNodeInput]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
    # Text
    detail: Int
    mode: TextModeType
    style: String
    text: String
    textFormat: Int
    textStyle: String
    # Code
    language: String
    # Heading (h1–h6) or list (ul, ol)
    tag: String
    # Image
    imageId: String
    size: String
    # List
    listType: ListType
    start: Int
    # List item
    checked: Boolean
    value: Int
    # Video
    videoId: String
  }

  input RootNodeInput {
    children: [EditorNodeInput]
    direction: ElementDirection
    format: Int
    indent: Int
    type: String
    version: Int
  }

  type EditorState {
    root: ElementNode
  }

  input EditorStateInput {
    root: RootNodeInput
  }
`;

export default EditorState;
