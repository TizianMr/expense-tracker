import { LOCALES } from '../constants';

export default {
  // This is the list of languages your application supports
  supportedLngs: LOCALES.map(locale => locale.value),
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: LOCALES[0].value,
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: 'common',
};
