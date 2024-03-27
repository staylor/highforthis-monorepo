import cn from 'classnames';

import { headingBase, heading2, heading3, heading4 } from '@/components/Heading';
import { orderedListBase, unorderedListBase } from '@/components/List';
import { paragraphBase } from '@/components/Paragraph';
import { blockquoteBase } from '@/components/Blockquote';

export default {
  code: cn('font-code p-2 text-base bg-[rgba(0,0,0,0.05)]'),
  heading: {
    h1: 'editor-heading-h1',
    h2: cn(headingBase, heading2),
    h3: cn(headingBase, heading3),
    h4: cn(headingBase, heading4),
    h5: 'editor-heading-h5',
  },
  image: 'editor-image',
  link: 'editor-link',
  list: {
    listitem: 'editor-listitem',
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: orderedListBase,
    ul: unorderedListBase,
  },
  ltr: 'ltr',
  paragraph: paragraphBase,
  placeholder: 'editor-placeholder',
  quote: blockquoteBase,
  rtl: 'rtl',
  text: {
    bold: 'editor-text-bold',
    code: 'editor-text-code',
    hashtag: 'editor-text-hashtag',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    strikethrough: 'editor-text-strikethrough',
    underline: 'editor-text-underline',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
  },
};
