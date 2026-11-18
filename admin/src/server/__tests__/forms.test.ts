// @vitest-environment node
import { gql } from 'graphql-tag';
import { describe, expect, it } from 'vitest';

import { deleteSelected, isRedirect, parseForm, submitForm } from '../forms';

import { calls, form, stubGraphQL } from './helpers';

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

describe('parseForm', () => {
  it('builds objects and arrays from bracketed field names', () => {
    const formData = form({
      'crops[0][name]': 'thumb',
      'crops[0][width]': '150',
      'crops[1][name]': 'large',
      'crops[1][width]': '1200',
      'artists[]': ['Wilco', 'Spoon & Co'],
    });
    expect(parseForm(formData)).toEqual({
      crops: [
        { name: 'thumb', width: 150 },
        { name: 'large', width: 1200 },
      ],
      artists: ['Wilco', 'Spoon & Co'],
    });
  });

  it('turns numbers and booleans into values and drops empty fields', () => {
    const formData = form({ title: 'Hello world', year: '2026', closed: 'false', notes: '' });
    expect(parseForm(formData)).toEqual({ title: 'Hello world', year: 2026, closed: false });
  });

  it('leaves skipped keys as they were typed', () => {
    const formData = form({ name: '311', slug: '311', year: '1994' });
    expect(parseForm(formData, { skipKeys: ['name', 'slug'] })).toEqual({
      name: '311',
      slug: '311',
      year: 1994,
    });
  });

  it('ignores uploaded files', () => {
    const formData = form({ title: 'Cover' });
    formData.append('file', new Blob(['data']), 'cover.jpg');
    expect(parseForm(formData)).toEqual({ title: 'Cover' });
  });
});

describe('submitForm', () => {
  it('saves the fields over the defaults and comes back with ?message=updated', async () => {
    const gql = stubGraphQL({ mutate: { saveThing: { id: '1' } } });
    const result = await submitForm({
      gql,
      formData: form({ title: 'New title', attended: 'true' }),
      url: new URL('http://localhost/admin/thing/1?tab=meta'),
      mutation: saveMutation,
      variables: { id: '1', input: { attended: false, notes: null } },
    });

    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'SaveThing',
        variables: { id: '1', input: { attended: true, notes: null, title: 'New title' } },
      },
    ]);
    expect(result).toEqual({
      redirectTo: 'http://localhost/admin/thing/1?tab=meta&message=updated',
    });
  });

  it("goes to the new item's edit page after adding", async () => {
    const gql = stubGraphQL({ mutate: { createThing: { id: 'abc123' } } });
    const result = await submitForm({
      gql,
      formData: form({ title: 'First' }),
      url: new URL('http://localhost/admin/thing/add'),
      mutation: createMutation,
      createMutation: 'createThing',
    });

    expect(calls(gql.mutate)).toEqual([
      { operation: 'CreateThing', variables: { input: { title: 'First' } } },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/thing/abc123?message=updated' });
  });

  it("sends the editor's state as JSON, with element formats as numbers", async () => {
    const gql = stubGraphQL();
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
      gql,
      formData: form({ editorState: JSON.stringify(editorState) }),
      url: new URL('http://localhost/admin/post/1'),
      mutation: saveMutation,
      variables: { id: '1' },
    });

    expect(gql.mutate.mock.calls[0][1]).toEqual({
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
      gql: stubGraphQL(),
      formData: form({}),
      url: new URL('http://localhost/admin/thing/1'),
      mutation: saveMutation,
    });
    expect(isRedirect(result)).toBeTruthy();
    expect(isRedirect({ errors: [] })).toBeFalsy();
  });
});

describe('deleteSelected', () => {
  it('deletes the checked rows and says how many', async () => {
    const gql = stubGraphQL({ mutate: { removeThing: true } });
    const result = await deleteSelected({
      gql,
      formData: form({ ids: ['1', '2'] }),
      url: new URL('http://localhost/admin/thing?page=2'),
      mutation: deleteMutation,
    });

    expect(calls(gql.mutate)).toEqual([
      { operation: 'DeleteThing', variables: { ids: ['1', '2'] } },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/thing?page=2&deleted=2' });
  });

  it('says the delete failed when GraphQL refuses it', async () => {
    // The client logs a GraphQL error, such as a missing admin session, and returns no data
    const gql = stubGraphQL({ mutate: {} });
    const result = await deleteSelected({
      gql,
      formData: form({ ids: ['1', '2'] }),
      url: new URL('http://localhost/admin/thing?page=2'),
      mutation: deleteMutation,
    });

    expect(result).toEqual({ redirectTo: 'http://localhost/admin/thing?page=2&deleteFailed=2' });
  });

  it('says the delete failed when the server reports false', async () => {
    const gql = stubGraphQL({ mutate: { removeThing: false } });
    const result = await deleteSelected({
      gql,
      formData: form({ ids: ['1'] }),
      url: new URL('http://localhost/admin/thing'),
      mutation: deleteMutation,
    });

    expect(result).toEqual({ redirectTo: 'http://localhost/admin/thing?deleteFailed=1' });
  });

  it('skips the mutation when nothing is checked', async () => {
    const gql = stubGraphQL();
    const result = await deleteSelected({
      gql,
      formData: form({}),
      url: new URL('http://localhost/admin/thing'),
      mutation: deleteMutation,
    });

    expect(gql.mutate).not.toHaveBeenCalled();
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/thing?deleted=0' });
  });
});
