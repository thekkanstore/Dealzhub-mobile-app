import * as Yup from 'yup';
import {
  emailValidation,
  addressValidation,
  personNameValidation,
  phoneNumberIndia,
} from './commonValiddations';

export const userDetailsValidationsSchema = (isEdit = false) => {
  return Yup.object({
    id: Yup.string().required('state is required'),
    email: emailValidation,
    name: personNameValidation,
    phoneNumber: phoneNumberIndia,
    address: addressValidation,
    state: Yup.string().required('State is required'),
    city: Yup.object().required('City is required'),
    isAgreeTermsAndCondition: isEdit
      ? Yup.boolean()
      : Yup.boolean()
          .oneOf([true], 'Please accept terms and conditions')
          .required('Please accept terms and conditions'),
  });
};
