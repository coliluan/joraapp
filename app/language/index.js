 
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import al from '../language/locales.js/al';
import en from '../language/locales.js/en';

const locales = {
  en: { translation: en },
  al: { translation: al }, 
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'al',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: locales,
  });

export default i18n;
