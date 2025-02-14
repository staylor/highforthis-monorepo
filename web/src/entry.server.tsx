import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { ServerRouter } from 'react-router';
import type { AppLoadContext, EntryContext } from 'react-router';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  loadContext: AppLoadContext
) {
  const params = {
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext,
    loadContext,
  };
  return isbot(request.headers.get('user-agent') || '')
    ? handle('onAllReady', params)
    : handle('onShellReady', params);
}

function handle(
  event: string,
  params: {
    request: Request;
    responseStatusCode: number;
    responseHeaders: Headers;
    reactRouterContext: EntryContext;
    loadContext: AppLoadContext;
  }
) {
  let { responseStatusCode } = params;
  const { request, responseHeaders, reactRouterContext, loadContext } = params;
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={loadContext.i18n}>
        <ServerRouter context={reactRouterContext} url={request.url} />
      </I18nextProvider>,
      {
        [event]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, 5000);
  });
}
