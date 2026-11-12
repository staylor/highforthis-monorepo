import { buildSchema, graphql } from 'graphql';
import { describe, expect, it, vi } from 'vitest';

import typeDefs from '#/schema';

import resolvers from '../EditorState';

vi.mock('#/database', () => ({ default: {} }));

const schema = buildSchema(typeDefs);

const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
});
const tab = {
  detail: 2,
  format: 0,
  mode: 'normal',
  style: '',
  text: '\t',
  type: 'tab',
  version: 1,
};
const linebreak = { type: 'linebreak', version: 1 };
const element = (type: string, children: object[], fields: object = {}) => ({
  children,
  direction: null,
  format: 0,
  indent: 0,
  type,
  version: 1,
  ...fields,
});

// what the editor submits for each block its toolbar makes: Lexical's JSON, with element formats
// set to 0 the way the web's form submission does
const editorState = {
  root: element('root', [
    element('paragraph', [text('Intro '), text('bold', 1), tab, text('tabbed')], {
      textFormat: 0,
      textStyle: '',
    }),
    element('heading', [text('Heading')], { tag: 'h3' }),
    element('quote', [text('Quoted'), linebreak, text('second line')]),
    element('code', [text('const a = 1;'), linebreak, text('const b = 2;')], {
      language: 'javascript',
    }),
    element(
      'list',
      [
        element('listitem', [text('One')], { value: 1 }),
        element('listitem', [text('Two '), text('bold', 1)], { value: 2 }),
      ],
      { listType: 'bullet', start: 1, tag: 'ul' }
    ),
    element('list', [element('listitem', [text('Third')], { value: 3 })], {
      listType: 'number',
      start: 3,
      tag: 'ol',
    }),
  ]),
};

interface SavedNode {
  type?: string;
  children?: SavedNode[];
  [field: string]: unknown;
}

const savePost = /* GraphQL */ `
  mutation SavePost($input: UpdatePostInput!) {
    updatePost(id: "post-1", input: $input) {
      editorState {
        root {
          children {
            ... on ElementNodeType {
              type
            }
            ... on ElementNode {
              children {
                ...Inline
              }
            }
            ... on HeadingNode {
              tag
              children {
                ...Inline
              }
            }
            ... on QuoteNode {
              children {
                ...Inline
              }
            }
            ... on CodeNode {
              language
              children {
                ...Inline
              }
            }
            ... on ListNode {
              listType
              start
              children {
                ... on ListItemNode {
                  type
                  value
                  children {
                    ...Inline
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fragment Inline on EditorNode {
    ... on TextNode {
      format
      text
      type
    }
    ... on LinebreakNode {
      type
    }
  }
`;

describe('editor state', () => {
  it('saves and loads every block the editor makes', async () => {
    const result = await graphql({
      schema,
      source: savePost,
      variableValues: { input: { editorState } },
      rootValue: {
        updatePost: ({ input }: { input: { editorState: unknown } }) => ({
          editorState: input.editorState,
        }),
      },
      typeResolver: resolvers.EditorNode.__resolveType,
    });

    expect(result.errors).toBeUndefined();
    const { editorState: saved } = result.data?.updatePost as { editorState: { root: SavedNode } };
    const [paragraph, heading, quote, code, bullets, numbers] = saved.root.children ?? [];
    expect(paragraph.children?.map(({ type }) => type)).toEqual(['text', 'text', 'tab', 'text']);
    expect(heading).toMatchObject({ tag: 'h3', children: [{ text: 'Heading' }] });
    expect(quote.children).toEqual([
      { format: 0, text: 'Quoted', type: 'text' },
      { type: 'linebreak' },
      { format: 0, text: 'second line', type: 'text' },
    ]);
    expect(code).toMatchObject({
      language: 'javascript',
      children: [{ text: 'const a = 1;' }, { type: 'linebreak' }, { text: 'const b = 2;' }],
    });
    expect(bullets).toEqual({
      type: 'list',
      listType: 'bullet',
      start: 1,
      children: [
        { type: 'listitem', value: 1, children: [{ format: 0, text: 'One', type: 'text' }] },
        {
          type: 'listitem',
          value: 2,
          children: [
            { format: 0, text: 'Two ', type: 'text' },
            { format: 1, text: 'bold', type: 'text' },
          ],
        },
      ],
    });
    expect(numbers).toMatchObject({ listType: 'number', start: 3 });
  });
});
