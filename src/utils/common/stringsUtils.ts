import {removeExtraWhitespaceRegExp} from '../reg-exp/regExpressions';

const removeExtraWhitespace = (text: string): string => {
  return text.replace(removeExtraWhitespaceRegExp, ' ').trim();
};

const toSnakeCase = (text: string): string => {
  return removeExtraWhitespace(text).toLowerCase().replace(/\s+/g, '_');
};

export {removeExtraWhitespace, toSnakeCase};
