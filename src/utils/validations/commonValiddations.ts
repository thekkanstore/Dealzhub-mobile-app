import * as Yup from 'yup';
import {onlyAlphabeticRegExp, emailRegExp} from '../reg-exp/regExpressions';
import {strings} from '../language/langauageUtils';

export const emailValidation = Yup.string()
  .matches(emailRegExp, strings('validations.emailInvalid'))
  .required(strings('validations.emailRequired'));
export const passwordValidation = Yup.string().required(strings('validations.passwordRequired'));
export const newPasswordValidation = Yup.string()
  .required('New password is required')
  .min(8, 'Password must be 8 characters long')
  .matches(/[0-9]/, 'Password requires a number')
  .matches(/^\S*$/, 'Password cannot contain spaces')
  .matches(/[a-z]/, 'Password requires a lowercase letter')
  .matches(/[A-Z]/, 'Password requires an uppercase letter')
  .matches(/[^\w]/, 'Password requires a special characters');

export const nameValidation = (name = 'Name') =>
  Yup.string()
    .required(`${name} is required`)
    .matches(
      onlyAlphabeticRegExp,
      'Only alphabetic characters and single space allowed between words',
    );

export const phoneNumberIndia = Yup.string()
  .required('Phone number is required')
  .matches(/^(\+91[-\s]?)?[6789]\d{9}$/, {
    message: 'Please enter a valid Indian mobile number',
    excludeEmptyString: true,
  })

  .length(10, 'Phone number must be exactly 10 digits');

export const phoneNumber = Yup.number()
  .required('Phone number is required')
  .typeError('Phone number must be a number')
  .positive('Phone number must be a positive number');

export const aadharNumber = Yup.string()
  .matches(/^\d{4} \d{4} \d{4}$/, strings('validations.aadharNumber'))
  .required(strings('validations.aadharRequired'));

export const otpNumber = Yup.string()
  .required('OTP is required')
  .matches(/^\d+$/, 'OTP must be a number')
  .length(6, 'OTP must be exactly 6 digits');

export const panNumber = Yup.string()
  .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, strings('validations.panInvalid'))
  .required(strings('validations.panRequired'));

export const validateOtp = (value: string) => {
  let error;
  if (!value) {
    error = 'OTP is required';
  } else if (!/^\d{6}$/.test(value)) {
    error = 'Invalid OTP. OTP must be exactly 6 digits and contain only numbers.';
  }
  return error;
};

export const addSpaceAfterFourLetters = (str: string): string => {
  const cleanText = str.replace(/\s/g, '');
  return cleanText.replace(/(.{4})/g, '$1 ').trim();
};

export const removeSpaces = (str: string): string => {
  return str.replace(/\s/g, '');
};

export const amountValidation = Yup.string()
  .required('Amount is required')
  .test('is-positive', 'Amount must be a positive number', value => Number(value) > 0);

export const docValidation = (name = 'Document') => Yup.mixed().required(`${name} is required`);
// .test({
//   name: 'doc_cert',
//   message: 'File size is too small. Minimum size is 34kb.',
//   test: value => {
//     if (typeof value === 'string') {
//       return true;
//     } else {
//       return value?.size >= FILE_SIZE;
//     }
//   },
// })
// .test({
//   name: 'doc_cert',
//   message: 'File size is too big. Maximum size is 5mb.',
//   test: value => {
//     if (typeof value === 'string') {
//       return true;
//     } else {
//       return value?.size <= MAX_SIZE;
//     }
//   },
// })
// .test(
//   'fileFormat',
//   'Unsupported file format. Only JPEG, JPG, PNG, and PDF files are allowed.',
//   value => {
//     if (typeof value === 'string') {
//       return true;
//     } else {
//       return SUPPORTED_FORMATS.includes(value.type);
//     }
//   },
// );

export const personNameValidation = Yup.string()
  .required('Person name is required')
  .min(3, 'Minimum 3 characters required')
  .max(50, 'Maximum 50 characters allowed')
  .matches(
    onlyAlphabeticRegExp,
    'Only alphabetic characters and single space allowed between words',
  );
export const addressValidation = Yup.string()
  .transform(value => value?.trim())
  .required('Address is required')
  .min(10, 'Minimum 10 characters required')
  .max(100, 'Maximum 100 characters allowed')
  .matches(/\d+/, 'Flat number must contain a  number');

export const pincodeValidation = Yup.string()
  .required('Postal code is required')
  .length(6, 'Postal code must be 6 digits');
