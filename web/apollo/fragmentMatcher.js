export default {
  possibleTypes: {
    EditorNode: [
      'CodeNode',
      'ElementNode',
      'HeadingNode',
      'ImageNode',
      'LinebreakNode',
      'QuoteNode',
      'TextNode',
      'VideoNode',
    ],
    ElementNodeType: [
      'CodeNode',
      'ElementNode',
      'HeadingNode',
      'ImageNode',
      'QuoteNode',
      'VideoNode',
    ],
    LexicalNode: [
      'CodeNode',
      'ElementNode',
      'HeadingNode',
      'ImageNode',
      'LinebreakNode',
      'QuoteNode',
      'TextNode',
      'VideoNode',
    ],
    MediaUpload: ['AudioUpload', 'FileUpload', 'ImageUpload', 'VideoUpload'],
    Term: ['Artist', 'Category', 'CrossStreet', 'Neighborhood', 'Place', 'Venue'],
  },
};
