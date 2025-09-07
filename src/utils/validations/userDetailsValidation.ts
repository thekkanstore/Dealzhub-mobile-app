import * as Yup from 'yup';
import {
  emailValidation,
  addressValidation,
  personNameValidation,
  phoneNumberIndia,
} from './commonValiddations';

export const useDetailsValidationsSchema = () => {
  return Yup.object({
    id: Yup.string().required('state is required'),
    email: emailValidation,
    name: personNameValidation,
    phoneNumber: phoneNumberIndia,
    address: addressValidation,
    state: Yup.string().required('State is required'),
    city: Yup.object().required('City is required'),
    isAgreeTermsAndCondition: Yup.boolean().required('Please accept terms and conditions'),
  });
};
