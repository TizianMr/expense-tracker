import { resolve } from 'node:path';
import path from 'path';
import { PassThrough } from 'stream';

import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import i18n from './utils/i18n/i18n';
import i18next from './utils/i18n/i18next.server';
import { resources } from './utils/i18n/resource';

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady';

  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);

  const ResourceBackend = resourcesToBackend((language, namespace, callback) => {
    const path = `../public/locales/${language}/${namespace}.json`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const resource = require(path);
      callback(null, resource);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Loading server locale failed', error);
      callback(new Error(`Could not locale at ${path}`), null);
    }
  });

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(ResourceBackend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
      backend: {
        localePath: path.resolve('./public/locales'),
        loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
      },
      resources, // prevent translations to flash on load
    });

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer
          context={remixContext}
          url={request.url}
        />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError() {
          didError = true;
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
