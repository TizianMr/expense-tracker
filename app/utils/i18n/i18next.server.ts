import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next/server';

import i18n from './i18n'; // your i18n configuration file
import { localeCookie } from '../cookies.server';

const __dirname = dirname(fileURLToPath(import.meta.url));

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: localeCookie,
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve(__dirname, './translations/{{lng}}/{{ns}}.json'),
    },
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend],
});

export default i18next;
