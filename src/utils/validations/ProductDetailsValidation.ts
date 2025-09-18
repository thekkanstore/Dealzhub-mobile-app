import * as Yup from 'yup';
import {amountValidation} from './commonValiddations';

export const productValidationsSchema = () => {
  return Yup.object({
    name: Yup.string()
      .transform(value => value?.trim())
      .required('Product is required')
      .min(3, 'Minimum 3 characters required')
      .max(50, 'Maximum 50 characters allowed'),
    description: Yup.string()
      .transform(value => value?.trim())
      .required('Address is required')
      .min(10, 'Minimum 10 characters required')
      .max(100, 'Maximum 100 characters allowed'),
    actualPrice: amountValidation,
    discountPrice: amountValidation,
    category: Yup.object().required('Choose one Category'),
    image: Yup.mixed().required('Image is required'),
    isActive: Yup.boolean().required('Please confirm the Active status'),
    isSecondHand: Yup.boolean().required('Please choose any of the option'),
  });
};
