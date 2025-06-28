// https://www.youtube.com/watch?v=kMuY6I0Z--g&t=646s

import german from '../../../public/locales/de/common.json';
import english from '../../../public/locales/en/common.json';

const languages = ['en', 'de'] as const;
export const supportedLanguages = [...languages];
export type Language = (typeof supportedLanguages)[number];

export type Resource = {
  common: typeof english;
};

export const resources: Record<Language, Resource> = {
  en: {
    common: english,
  },
  de: {
    common: german,
  },
};
