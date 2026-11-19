import type { OperationVariables } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import qs from 'qs';

/**
 * What the admin's data functions take instead of a request, so they don't depend on a
 * framework. A failed operation is logged and comes back as empty data, which is how
 * `submitForm` and `deleteSelected` tell that it failed.
 */
export interface GraphQLClient {
  query<T>(query: DocumentNode, variables?: OperationVariables): Promise<T>;
  mutate<T>(mutation: DocumentNode, variables?: OperationVariables): Promise<T>;
}

// Turns submitted strings into the numbers and booleans GraphQL expects, and drops empty values
function isObject(val: any) {
  return val.constructor === Object;
}

function isNumber(val: any) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function isBoolean(val: string) {
  return val === 'false' || val === 'true';
}

function isArray(val: any) {
  return Array.isArray(val);
}

function parseValue(val: any) {
  if (typeof val === 'undefined' || val === '') {
    return null;
  } else if (isBoolean(val)) {
    return parseBoolean(val);
  } else if (isArray(val)) {
    return parseArray(val);
  } else if (isObject(val)) {
    return parseObject(val);
  } else if (isNumber(val)) {
    return parseNumber(val);
  } else {
    return val;
  }
}

function parseArray(arr: any[]) {
  const result: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    result[i] = parseValue(arr[i]);
  }
  return result;
}

function parseNumber(val: any) {
  return Number(val);
}

function parseBoolean(val: any) {
  return val === 'true';
}

function parseObject(obj: Record<string, any>, skipKeys?: string[]) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (skipKeys?.includes(key)) {
      result[key] = obj[key];
      continue;
    }

    const val = parseValue(obj[key]);
    if (val !== null) result[key] = val;
  }
  return result;
}

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

// Saves an add or edit form, then comes back to the form's page with ?message=updated, or with
// ?saveFailed=1 when the mutation didn't succeed
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
  const result = await gql.mutate<Record<string, { id: string } | null>>(mutation, mergedVariables);
  // The client turns a GraphQL error, such as input the server rejects, into empty data
  const saved = createMutation ? result[createMutation] : Object.values(result)[0];
  // The form posts to its own URL, which can still say how the last save went
  const redirectUrl = new URL(url);
  redirectUrl.searchParams.delete('message');
  redirectUrl.searchParams.delete('saveFailed');
  if (!saved) {
    redirectUrl.searchParams.set('saveFailed', '1');
    return { redirectTo: redirectUrl.toString() };
  }
  if (createMutation) {
    redirectUrl.pathname = redirectUrl.pathname.replace('/add', `/${saved.id}`);
  }
  redirectUrl.searchParams.set('message', 'updated');

  return { redirectTo: redirectUrl.toString() };
}

interface DeleteSelectedArgs extends FormArgs {
  mutation: DocumentNode;
}

// Deletes the list rows checked in a list page's form, then comes back to the list with
// ?deleted=<count>, or ?deleteFailed=<count> when the mutation didn't succeed
export async function deleteSelected({
  gql,
  formData,
  url,
  mutation,
}: DeleteSelectedArgs): Promise<RedirectResult> {
  const ids = formData.getAll('ids');
  const redirectUrl = new URL(url);
  if (ids.length > 0) {
    // The remove mutations return true on success. The client turns a GraphQL error, such as
    // a missing admin session, into empty data.
    const result = await gql.mutate<Record<string, unknown>>(mutation, { ids });
    if (!Object.values(result).includes(true)) {
      redirectUrl.searchParams.set('deleteFailed', ids.length.toString());
      return { redirectTo: redirectUrl.toString() };
    }
  }
  redirectUrl.searchParams.set('deleted', ids.length.toString());
  return { redirectTo: redirectUrl.toString() };
}
