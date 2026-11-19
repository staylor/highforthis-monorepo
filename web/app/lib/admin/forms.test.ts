import type { OperationVariables } from '@apollo/client/core';
import { getOperationAST, type DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { deleteSelected, isRedirect, parseForm, submitForm, type GraphQLClient } from './forms.ts';
import { addPageOffset, addSearchParam } from './list-variables.ts';

// The admin's shared form and list helpers, which every section's data functions use.

const saveMutation = gql`
  mutation SaveThing($id: String, $input: ThingInput!) {
    saveThing(id: $id, input: $input) {
      id
    }
  }
`;

const createMutation = gql`
  mutation CreateThing($input: ThingInput!) {
    createThing(input: $input) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteThing($ids: [String]!) {
    removeThing(ids: $ids)
  }
`;

type Call = { operation?: string; variables?: OperationVariables };

/** A GraphQL client whose mutations resolve to the given data, recording each one by name. */
function stubGraphQL(mutate: unknown = {}) {
  const calls: Call[] = [];
  const client: GraphQLClient = {
    async query() {
      return {} as never;
    },
    async mutate(document: DocumentNode, variables?: OperationVariables) {
      calls.push({ operation: getOperationAST(document)?.name?.value, variables });
      return mutate as never;
    },
  };
  return { client, calls };
}

/** A submitted form; an array value is a field repeated, like checked boxes sharing a name. */
function form(fields: Record<string, string | string[]>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      formData.append(name, item);
    }
  }
  return formData;
}

describe('parseForm', () => {
  it('builds objects and arrays from bracketed field names', () => {
    const formData = form({
      'crops[0][name]': 'thumb',
      'crops[0][width]': '150',
      'crops[1][name]': 'large',
      'crops[1][width]': '1200',
      'artists[]': ['Wilco', 'Spoon & Co'],
    });
    assert.deepEqual(parseForm(formData), {
      crops: [
        { name: 'thumb', width: 150 },
        { name: 'large', width: 1200 },
      ],
      artists: ['Wilco', 'Spoon & Co'],
    });
  });

  it('collects a name given more than once, and keeps a name given once as a value', () => {
    const formData = form({ tags: ['rock', 'live'], venue: 'v1', 'coordinates[latitude]': '40.7' });
    assert.deepEqual(parseForm(formData), {
      tags: ['rock', 'live'],
      venue: 'v1',
      coordinates: { latitude: 40.7 },
    });
  });

  it('ignores names that would reach an object prototype', () => {
    const formData = form({ '__proto__[admin]': 'true', 'title[constructor]': 'x', title: 'Hi' });
    assert.deepEqual(parseForm(formData), { title: 'Hi' });
    assert.equal(({} as Record<string, unknown>).admin, undefined);
  });

  it('turns numbers and booleans into values and drops empty fields', () => {
    const formData = form({ title: 'Hello world', year: '2026', closed: 'false', notes: '' });
    assert.deepEqual(parseForm(formData), { title: 'Hello world', year: 2026, closed: false });
  });

  it('leaves skipped keys as they were typed', () => {
    const formData = form({ name: '311', slug: '311', year: '1994' });
    assert.deepEqual(parseForm(formData, { skipKeys: ['name', 'slug'] }), {
      name: '311',
      slug: '311',
      year: 1994,
    });
  });

  it('ignores uploaded files', () => {
    const formData = form({ title: 'Cover' });
    formData.append('file', new Blob(['data']), 'cover.jpg');
    assert.deepEqual(parseForm(formData), { title: 'Cover' });
  });
});

describe('submitForm', () => {
  it('saves the fields over the defaults and comes back with ?message=updated', async () => {
    const { client, calls } = stubGraphQL({ saveThing: { id: '1' } });
    const result = await submitForm({
      gql: client,
      formData: form({ title: 'New title', attended: 'true' }),
      url: new URL('http://localhost/admin/thing/1?tab=meta'),
      mutation: saveMutation,
      variables: { id: '1', input: { attended: false, notes: null } },
    });

    assert.deepEqual(calls, [
      {
        operation: 'SaveThing',
        variables: { id: '1', input: { attended: true, notes: null, title: 'New title' } },
      },
    ]);
    assert.deepEqual(result, {
      redirectTo: 'http://localhost/admin/thing/1?tab=meta&message=updated',
    });
  });

  it("goes to the new item's edit page after adding", async () => {
    const { client, calls } = stubGraphQL({ createThing: { id: 'abc123' } });
    const result = await submitForm({
      gql: client,
      formData: form({ title: 'First' }),
      url: new URL('http://localhost/admin/thing/add'),
      mutation: createMutation,
      createMutation: 'createThing',
    });

    assert.deepEqual(calls, [
      { operation: 'CreateThing', variables: { input: { title: 'First' } } },
    ]);
    assert.deepEqual(result, {
      redirectTo: 'http://localhost/admin/thing/abc123?message=updated',
    });
  });

  it('says the save failed when GraphQL refuses it', async () => {
    // The client logs a GraphQL error, such as a missing required field, and returns no data
    const result = await submitForm({
      gql: stubGraphQL({}).client,
      formData: form({ title: 'New title' }),
      url: new URL('http://localhost/admin/thing/1?tab=meta&message=updated'),
      mutation: saveMutation,
      variables: { id: '1' },
    });
    assert.deepEqual(result, {
      redirectTo: 'http://localhost/admin/thing/1?tab=meta&saveFailed=1',
    });
  });

  it('stays on the add page when adding fails', async () => {
    const result = await submitForm({
      gql: stubGraphQL({ createThing: null }).client,
      formData: form({ title: 'First' }),
      url: new URL('http://localhost/admin/thing/add'),
      mutation: createMutation,
      createMutation: 'createThing',
    });
    assert.deepEqual(result, { redirectTo: 'http://localhost/admin/thing/add?saveFailed=1' });
  });

  it("drops the last save's failure once a save works", async () => {
    const result = await submitForm({
      gql: stubGraphQL({ saveThing: { id: '1' } }).client,
      formData: form({ title: 'New title' }),
      url: new URL('http://localhost/admin/thing/1?saveFailed=1'),
      mutation: saveMutation,
      variables: { id: '1' },
    });
    assert.deepEqual(result, { redirectTo: 'http://localhost/admin/thing/1?message=updated' });
  });

  it("sends the editor's state as JSON, with element formats as numbers", async () => {
    const { client, calls } = stubGraphQL();
    const editorState = {
      root: {
        format: '',
        children: [
          { type: 'paragraph', format: 'center', children: [{ type: 'text', format: 1 }] },
          { type: 'heading', format: 2, children: [] },
        ],
      },
    };
    await submitForm({
      gql: client,
      formData: form({ editorState: JSON.stringify(editorState) }),
      url: new URL('http://localhost/admin/post/1'),
      mutation: saveMutation,
      variables: { id: '1' },
    });

    assert.deepEqual(calls[0].variables, {
      id: '1',
      input: {
        editorState: {
          root: {
            format: 0,
            children: [
              { type: 'paragraph', format: 0, children: [{ type: 'text', format: 1 }] },
              { type: 'heading', format: 2, children: [] },
            ],
          },
        },
      },
    });
  });

  it('returns a redirect', async () => {
    const result = await submitForm({
      gql: stubGraphQL().client,
      formData: form({}),
      url: new URL('http://localhost/admin/thing/1'),
      mutation: saveMutation,
    });
    assert.ok(isRedirect(result));
    assert.ok(!isRedirect({ errors: [] }));
  });
});

describe('deleteSelected', () => {
  it('deletes the checked rows and says how many', async () => {
    const { client, calls } = stubGraphQL({ removeThing: true });
    const result = await deleteSelected({
      gql: client,
      formData: form({ ids: ['1', '2'] }),
      url: new URL('http://localhost/admin/thing?page=2'),
      mutation: deleteMutation,
    });

    assert.deepEqual(calls, [{ operation: 'DeleteThing', variables: { ids: ['1', '2'] } }]);
    assert.deepEqual(result, { redirectTo: 'http://localhost/admin/thing?page=2&deleted=2' });
  });

  it('says the delete failed when GraphQL refuses it', async () => {
    // The client logs a GraphQL error, such as a missing admin session, and returns no data
    const result = await deleteSelected({
      gql: stubGraphQL({}).client,
      formData: form({ ids: ['1', '2'] }),
      url: new URL('http://localhost/admin/thing?page=2'),
      mutation: deleteMutation,
    });
    assert.deepEqual(result, {
      redirectTo: 'http://localhost/admin/thing?page=2&deleteFailed=2',
    });
  });

  it('says the delete failed when the server reports false', async () => {
    const result = await deleteSelected({
      gql: stubGraphQL({ removeThing: false }).client,
      formData: form({ ids: ['1'] }),
      url: new URL('http://localhost/admin/thing'),
      mutation: deleteMutation,
    });
    assert.deepEqual(result, { redirectTo: 'http://localhost/admin/thing?deleteFailed=1' });
  });

  it('skips the mutation when nothing is checked', async () => {
    const { client, calls } = stubGraphQL();
    const result = await deleteSelected({
      gql: client,
      formData: form({}),
      url: new URL('http://localhost/admin/thing'),
      mutation: deleteMutation,
    });
    assert.equal(calls.length, 0);
    assert.deepEqual(result, { redirectTo: 'http://localhost/admin/thing?deleted=0' });
  });
});

describe('listVariables', () => {
  it('asks for a page of rows, after the cursor of the last row on the previous page', () => {
    assert.deepEqual(addPageOffset(new URLSearchParams()), { first: 20 });
    // Page 2 starts after row 19: base64 of 'arrayconnection:19', as GraphQL's connections encode it
    assert.deepEqual(addPageOffset(new URLSearchParams('page=2')), {
      first: 20,
      after: 'YXJyYXljb25uZWN0aW9uOjE5',
    });
    assert.equal(
      addPageOffset(new URLSearchParams('page=2'), { first: 8 }).after,
      btoa('arrayconnection:7')
    );
  });

  it('adds the search term when there is one', () => {
    assert.deepEqual(addSearchParam(new URLSearchParams('search=wilco')), { search: 'wilco' });
    assert.deepEqual(addSearchParam(new URLSearchParams('search=')), {});
  });
});
