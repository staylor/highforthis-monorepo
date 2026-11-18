import type { OperationVariables } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import qs from 'qs';

import parseObject from '#/utils/parseObject';

import type { GraphQLClient } from './graphql';

// What a data function returns when the page should go somewhere else. The route turns it
// into a redirect response.
export interface RedirectResult {
  redirectTo: string;
}

export const isRedirect = (result: unknown): result is RedirectResult =>
  typeof result === 'object' && result !== null && 'redirectTo' in result;

interface ParseFormOptions {
  // Keys whose values stay strings, like a name of "311"
  skipKeys?: string[];
}

// The admin forms name nested fields like foo[0][bar][baz], which FormData leaves flat, so
// the fields go back through qs to build objects and arrays. parseObject then turns the
// values into numbers and booleans, since GraphQL rejects an `Int` sent as a string, and
// drops empty fields.
export function parseForm(formData: FormData, options?: ParseFormOptions) {
  const params = new URLSearchParams();
  for (const [key, value] of formData) {
    if (typeof value === 'string') {
      params.append(key, value);
    }
  }
  return parseObject(qs.parse(params.toString()), options?.skipKeys);
}

interface SubmittedNode {
  format?: unknown;
  children?: SubmittedNode[];
}

// Lexical saves an element's alignment as a string ('' when unset), but the schema's `format` is
// the text format bitmask, and the site doesn't align blocks
function clearElementFormats(node: SubmittedNode) {
  if (!Array.isArray(node.children)) {
    return;
  }
  if (typeof node.format !== 'number') {
    node.format = 0;
  }
  node.children.forEach(clearElementFormats);
}

// A submitted form, and the page it was submitted on, which the redirect comes back to
export interface FormArgs {
  gql: GraphQLClient;
  formData: FormData;
  url: URL;
}

interface SubmitFormArgs extends FormArgs, ParseFormOptions {
  mutation: DocumentNode;
  // Merged under the form's fields; `input` holds defaults for fields a form can leave out
  variables?: OperationVariables;
  // On an add page, the mutation field holding the new item's ID, so the redirect goes to its
  // edit page
  createMutation?: string;
}

// Saves an add or edit form, then comes back to the form's page with ?message=updated
export async function submitForm({
  gql,
  formData,
  url,
  mutation,
  variables,
  createMutation,
  skipKeys,
}: SubmitFormArgs): Promise<RedirectResult> {
  const input = parseForm(formData, { skipKeys });
  if (input.editorState) {
    input.editorState = JSON.parse(input.editorState);
    clearElementFormats(input.editorState.root);
  }

  const mergedVariables = { ...variables };
  if (mergedVariables.input) {
    mergedVariables.input = {
      ...mergedVariables.input,
      ...input,
    };
  } else {
    mergedVariables.input = input;
  }
  const result = await gql.mutate<Record<string, any>>(mutation, mergedVariables);
  const redirectUrl = new URL(url);
  if (createMutation) {
    redirectUrl.pathname = redirectUrl.pathname.replace('/add', `/${result[createMutation].id}`);
  }
  redirectUrl.searchParams.set('message', 'updated');

  return { redirectTo: redirectUrl.toString() };
}

interface DeleteSelectedArgs extends FormArgs {
  mutation: DocumentNode;
}

// Deletes the list rows checked in a list page's form, then comes back to the list with
// ?deleted=<count>
export async function deleteSelected({
  gql,
  formData,
  url,
  mutation,
}: DeleteSelectedArgs): Promise<RedirectResult> {
  const ids = formData.getAll('ids');
  if (ids.length > 0) {
    await gql.mutate(mutation, { ids });
  }
  const redirectUrl = new URL(url);
  redirectUrl.searchParams.set('deleted', ids.length.toString());
  return { redirectTo: redirectUrl.toString() };
}
