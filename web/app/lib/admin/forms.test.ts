import { getOperationAST, type DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { GraphQLRequestError, type Variables } from '#/lib/graphql.ts';

import { deleteSelected, isRedirect, parseForm, submitForm, type GraphQLClient } from './forms.ts';
import { listVariables } from './list-variables.ts';

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

type Call = { operation?: string; variables?: Variables };

/**
 * A GraphQL client whose mutations resolve to the given data, or reject with the given error,
 * recording each one by name.
 */
function stubGraphQL(mutate: unknown = {}) {
  const calls: Call[] = [];
  const client: GraphQLClient = {
    async query() {
      return {} as never;
    },
    async mutate(document: DocumentNode, variables?: Variables) {
      calls.push({ operation: getOperationAST(document)?.name?.value, variables });
      if (mutate instanceof Error) {
        throw mutate;
      }
      return mutate as never;
    },
  };
  return { client, calls };
}

// What the client rejects with when GraphQL turns a mutation down, or can't be reached
const refused = new GraphQLRequestError('SaveThing failed: Admin access required');

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

  it('leaves text fields as they were typed, and makes an emptied one null', () => {
    const formData = form({
      name: '311',
      notes: 'true',
      website: '',
      tags: ['311', 'Low'],
      year: '1994',
      venue: '',
    });
    const textFields = ['name', 'notes', 'website', 'tags', 'summary'];
    assert.deepEqual(parseForm(formData, { textFields }), {
      name: '311',
      notes: 'true',
      website: null,
      tags: ['311', 'Low'],
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

  it("hands back what was submitted when GraphQL can't save it", async () => {
    const result = await submitForm({
      gql: stubGraphQL(refused).client,
      formData: form({ title: 'New title', year: '2026', 'crops[0][name]': 'thumb', notes: '' }),
      url: new URL('http://localhost/admin/thing/1?tab=meta&message=updated'),
      mutation: saveMutation,
      variables: { id: '1' },
    });
    // As submitted, for the form to show again: still strings, empty ones included
    assert.deepEqual(result, {
      values: { title: 'New title', year: '2026', crops: [{ name: 'thumb' }], notes: '' },
      reason: undefined,
      status: 502,
    });
    assert.ok(!isRedirect(result));
  });

  it('says what GraphQL found wrong with the input', async () => {
    const invalid = new GraphQLRequestError('SaveThing failed: Invalid input (title: Too small)');
    invalid.invalid = 'Invalid input (title: Too small)';
    const result = await submitForm({
      gql: stubGraphQL(invalid).client,
      formData: form({ title: '' }),
      url: new URL('http://localhost/admin/thing/1'),
      mutation: saveMutation,
      variables: { id: '1' },
    });
    assert.deepEqual(result, {
      values: { title: '' },
      reason: 'Invalid input (title: Too small)',
      status: 422,
    });
  });

  it("hands back what was submitted when there's nothing to save it to", async () => {
    const result = await submitForm({
      gql: stubGraphQL({ createThing: null }).client,
      formData: form({ title: 'First' }),
      url: new URL('http://localhost/admin/thing/add'),
      mutation: createMutation,
      createMutation: 'createThing',
    });
    assert.deepEqual(result, { values: { title: 'First' }, reason: undefined, status: 422 });
  });

  it('lets a form adjust its fields before they are sent', async () => {
    const { client, calls } = stubGraphQL({ saveThing: { id: '1' } });
    await submitForm({
      gql: client,
      formData: form({ description: '' }),
      url: new URL('http://localhost/admin/thing/1'),
      mutation: saveMutation,
      textFields: ['description'],
      prepare(input) {
        input.description ??= '';
      },
    });
    assert.deepEqual(calls[0].variables, { input: { description: '' } });
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
      gql: stubGraphQL({ saveThing: { id: '1' } }).client,
      formData: form({}),
      url: new URL('http://localhost/admin/thing/1'),
      mutation: saveMutation,
    });
    assert.ok(isRedirect(result));
    assert.ok(!isRedirect({ errors: [] }));
  });
});

describe('a mutation that breaks for another reason', () => {
  it("isn't taken for a save or a delete that failed", async () => {
    const bug = new TypeError('a bug');
    const args = { formData: form({ ids: '1' }), url: new URL('http://localhost/admin/thing') };
    await assert.rejects(
      submitForm({ ...args, gql: stubGraphQL(bug).client, mutation: saveMutation }),
      TypeError
    );
    await assert.rejects(
      deleteSelected({ ...args, gql: stubGraphQL(bug).client, mutation: deleteMutation }),
      TypeError
    );
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
    const result = await deleteSelected({
      gql: stubGraphQL(refused).client,
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
    assert.deepEqual(listVariables(new URLSearchParams()), { first: 20 });
    // Page 2 starts after row 19: base64 of 'arrayconnection:19', as GraphQL's connections encode it
    assert.deepEqual(listVariables(new URLSearchParams('page=2')), {
      first: 20,
      after: 'YXJyYXljb25uZWN0aW9uOjE5',
    });
    assert.equal(
      listVariables(new URLSearchParams('page=2'), { first: 8 }).after,
      btoa('arrayconnection:7')
    );
  });

  it('adds the search term when there is one', () => {
    assert.deepEqual(listVariables(new URLSearchParams('search=wilco')), {
      first: 20,
      search: 'wilco',
    });
    assert.deepEqual(listVariables(new URLSearchParams('search=')), { first: 20 });
  });

  it('keeps the variables it starts from', () => {
    assert.deepEqual(listVariables(new URLSearchParams(), { order: 'DESC' }), {
      order: 'DESC',
      first: 20,
    });
  });
});
