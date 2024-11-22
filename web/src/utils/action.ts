import type { OperationVariables } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

import type { ParseFormDataArgs } from './mutate';
import mutate, { parseFormData } from './mutate';

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
  mutation,
  variables,
  createMutation,
  parseFormDataArgs,
}: Pick<ActionFunctionArgs, 'request' | 'context'> & {
  mutation: DocumentNode;
  variables?: OperationVariables;
  createMutation?: string;
  parseFormDataArgs?: ParseFormDataArgs;
}) => {
  const input = await parseFormData(request, parseFormDataArgs);
  if (input.editorState) {
    input.editorState = JSON.parse(input.editorState);
    // this seems like a bug in Lexical
    input.editorState.root.format = input.editorState.root.format || 0;
    input.editorState.root.children.forEach((child: any) => {
      child.format = child.format || 0;
    });
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
    mutation,
    variables: mergedVariables,
  });
  let editUrl = request.url;
  if (createMutation) {
    editUrl = request.url.replace('/add', `/${result[createMutation].id}`);
  }

  const url = new URL(editUrl);
  url.searchParams.set('message', 'updated');

  return redirect(url.toString());
};

export const handleDelete = async ({
  request,
  context,
  mutation,
}: Pick<ActionFunctionArgs, 'request' | 'context'> & { mutation: DocumentNode }) => {
  const url = new URL(request.url);
  if (request.method === 'DELETE') {
    const formData = await request.formData();
    const ids = formData.getAll('ids');

    if (ids.length > 0) {
      await mutate({
        context,
        mutation,
        variables: {
          ids,
        },
      });
    }
    url.searchParams.set('deleted', ids.length.toString());
  }
  return redirect(url.toString());
};
