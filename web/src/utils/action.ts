import type { OperationVariables } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

import type { ParseFormDataArgs } from './mutate';
import mutate, { parseFormData } from './mutate';

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

export const post = async (url: string, data: Record<string, any>) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      return responseData;
    });

export const handleSubmission = async ({
  context,
  request,
  url,
  mutation,
  variables,
  createMutation,
  parseFormDataArgs,
}: Pick<ActionFunctionArgs, 'request' | 'url' | 'context'> & {
  mutation: DocumentNode;
  variables?: OperationVariables;
  createMutation?: string;
  parseFormDataArgs?: ParseFormDataArgs;
}) => {
  const input = await parseFormData(request, parseFormDataArgs);
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
  const result: Record<string, any> = await mutate({
    context,
    request,
    mutation,
    variables: mergedVariables,
  });
  const redirectUrl = new URL(url);
  if (createMutation) {
    redirectUrl.pathname = redirectUrl.pathname.replace('/add', `/${result[createMutation].id}`);
  }
  redirectUrl.searchParams.set('message', 'updated');

  return redirect(redirectUrl.toString());
};

export const handleDelete = async ({
  request,
  url,
  context,
  mutation,
}: Pick<ActionFunctionArgs, 'request' | 'url' | 'context'> & { mutation: DocumentNode }) => {
  const redirectUrl = new URL(url);
  if (request.method === 'DELETE') {
    const formData = await request.formData();
    const ids = formData.getAll('ids');

    if (ids.length > 0) {
      await mutate({
        context,
        request,
        mutation,
        variables: {
          ids,
        },
      });
    }
    redirectUrl.searchParams.set('deleted', ids.length.toString());
  }
  return redirect(redirectUrl.toString());
};
