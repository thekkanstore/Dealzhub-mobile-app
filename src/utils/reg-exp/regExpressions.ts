export const onlyAlphabeticRegExp = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
export const gstRegExp = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
export const onlyAlphabetsAndNumbersRegExp = /^[a-zA-Z0-9]+$/;
export const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
export const singleSpaceRegExp = /^[^\s]+(\s[^\s]+)*$/;

export const removeExtraWhitespaceRegExp = /\s+/g;
export const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
