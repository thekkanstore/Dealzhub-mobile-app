import i18n from './translation';

export const strings = (key: string, params?: any): string => {
  try {
    const translation = i18n.t(key, params);
    if (translation === key) {
      console.warn(`Translation missing for key: ${key}`);
    }
    return translation as string;
  } catch (error) {
    console.error(`Translation error for key "${key}":`, error);
    return key;
  }
};
