import {removeExtraWhitespaceRegExp} from '../reg-exp/regExpressions';

const removeExtraWhitespace = (text: string): string => {
  return text.replace(removeExtraWhitespaceRegExp, ' ').trim();
};
export {removeExtraWhitespace};
