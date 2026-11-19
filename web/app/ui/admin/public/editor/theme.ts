import type { EditorThemeClasses } from 'lexical';

// The classes Lexical gives a post's blocks and text, from the admin app's Editor/theme.ts. The
// blocks look as they do on the public site; their class strings are inlined from the admin app's
// Heading, Blockquote, List and Paragraph components.

const headingBase = 'block mb-2 lg:mb-3 dark:text-white';

export const theme: EditorThemeClasses = {
  code: 'font-code p-2 text-base bg-[rgba(0,0,0,0.05)]',
  heading: {
    h1: 'editor-heading-h1',
    h2: `${headingBase} font-bold text-2xl`,
    h3: `${headingBase} font-bold border-pink inline-block border-b-2 border-dashed mt-6 py-1 pl-0.5 pr-6 text-2xl`,
    h4: `${headingBase} font-bold text-lg`,
    h5: 'editor-heading-h5',
  },
  image: 'editor-image',
  link: 'editor-link',
  list: {
    listitem: 'editor-listitem',
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'list-decimal my-5 ml-8',
    ul: 'list-disc my-5 ml-8',
  },
  ltr: 'ltr',
  paragraph: 'mb-6',
  placeholder: 'editor-placeholder',
  quote: 'font-georgia text-[#666] border-l-4 border-detail italic my-4 py-2.5 px-5',
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
