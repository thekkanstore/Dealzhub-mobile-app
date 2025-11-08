import i18n, {LanguageDetectorModule} from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {en} from './en';

// Add both English and Hindi languages
const LANGUAGES = {
  en: {
    translation: en,
  },
};

export const LANG_CODES = Object.keys(LANGUAGES);

const LANGUAGE_DETECTOR: LanguageDetectorModule = {
  type: 'languageDetector',
  // async: true,
  detect: () => {
    return 'en';
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

// Initialize i18n
const initializeI18n = async () => {
  await i18n
    .use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources: LANGUAGES,
      fallbackLng: 'en',
      defaultNS: 'translation',
      ns: ['translation'],
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
      debug: __DEV__,
    });
};

// Execute initialization
initializeI18n().catch(error => {
  console.error('Failed to initialize i18n:', error);
});

export default i18n;
