import qs from 'qs';
import { parseObject } from 'query-types';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';
import type { DocumentNode } from 'graphql';
import type { OperationVariables } from '@apollo/client';

import mutate from './mutate';

export const post = async (url: string, data: AppData) =>
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
}: Pick<DataFunctionArgs, 'request' | 'context'> & {
  mutation: DocumentNode;
  variables?: OperationVariables;
  createMutation?: string;
}) => {
  // FormData returns multi-dimensional keys as: foo[0][bar][baz]
  // - we would have to write our own parser, so:
  // text() returns the POST data as an x-www-form-urlencoded string
  const formData = await request.text();
  // qs parses the string into an object
  // parseObject corces the values into their proper types (numbers, booleans, etc)
  // GraphQL will throw an error if `Int`s are passed as strings.
  const input = parseObject(qs.parse(formData));
  if (input.editorState) {
    input.editorState = JSON.parse(input.editorState);
    // this seems like a bug in Lexical
    input.editorState.root.format = input.editorState.root.format || 0;
    input.editorState.root.children.forEach((child: any) => {
      child.format = child.format || 0;
    });
  }

  const result: AppData = await mutate({ context, mutation, variables: { ...variables, input } });
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
}: Pick<DataFunctionArgs, 'request' | 'context'> & { mutation: DocumentNode }) => {
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
