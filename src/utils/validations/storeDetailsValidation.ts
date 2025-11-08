import * as Yup from 'yup';
import {emailValidation, addressValidation, phoneNumberIndia} from './commonValiddations';

export const storeDetailsValidationsSchema = () => {
  return Yup.object({
    storeName: Yup.string()
      .required('Store name is required')
      .min(3, 'Minimum 3 characters required')
      .max(50, 'Maximum 50 characters allowed'),
    email: emailValidation,
    phoneNumber: phoneNumberIndia,
    address: addressValidation,
    state: Yup.string().required('state is required'),
    city: Yup.object().required('City is required'),
    isActive: Yup.boolean().required('Please accept terms and conditions'),
  });
};
