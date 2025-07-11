import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import al from '../language/locales.js/al';
import en from '../language/locales.js/en';

const locales = {
  en: { translation: en },
  al: { translation: al },
};

// Initialize i18n with default configuration
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'al',  // Default language
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: locales,
  });

// Load the language preference from AsyncStorage and set it on i18n initialization
const loadLanguagePreference = async () => {
  try {
    // Check if we're in a web environment and if window is available
    if (typeof window !== 'undefined') {
      const lang = await AsyncStorage.getItem('language');  // Get language from AsyncStorage
      if (lang) {
        i18n.changeLanguage(lang);  // Set the language if found
      } else {
        i18n.changeLanguage('al');  // Default to Albanian if no preference is found
      }
    } else {
      // For non-web environments, set default language
      i18n.changeLanguage('al');
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
    // Fallback to default language
    i18n.changeLanguage('al');
  }
};

// Call loadLanguagePreference to set the language on app start
loadLanguagePreference();

export default i18n;
