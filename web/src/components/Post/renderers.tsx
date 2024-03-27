import type { ReactNode } from 'react';

import { OrderedList, UnorderedList } from '@/components/List';

interface Meta {
  [key: string]: any;
}

export default {
  /**
   * Blocks receive children and depth
   * Note that children are an array of blocks with same styling,
   */
  blocks: {
    // or depth for nested lists
    'unordered-list-item': (children: ReactNode[], { depth, keys }: Meta) => (
      // eslint-disable-next-line tailwindcss/no-custom-classname
      <UnorderedList key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
        {children.map((child, index) => (
          <li key={keys[index]}>{child}</li>
        ))}
      </UnorderedList>
    ),
    'ordered-list-item': (children: ReactNode[], { depth, keys }: Meta) => (
      // eslint-disable-next-line tailwindcss/no-custom-classname
      <OrderedList key={keys.join('|')} className={`ol-level-${depth}`}>
        {children.map((child, index) => (
          <li key={keys[index]}>{child}</li>
        ))}
      </OrderedList>
    ),

    // If your blocks use meta data it can also be accessed like keys
    // atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i] {...data[i]} />),
    // atomic: (children, data) =>
    //   children.map((child, i) => {
    //     console.log(data);
    //   }),
  },
  entities: {
    // key is the entity key value from raw
    LINK: (children: ReactNode[], data: Meta, { key }: Meta) => (
      <a key={key} href={data.href} className="text-pink">
        {children}
      </a>
    ),
    EMBED: (_: Meta, data: Meta, { key }: Meta) => (
      <div className="my-5" key={key} dangerouslySetInnerHTML={{ __html: data.html }} />
    ),
  },
};
