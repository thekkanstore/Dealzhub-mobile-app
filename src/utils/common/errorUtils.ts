import {FormikErrors, FormikTouched} from 'formik';

export const shouldShowError = <T extends object>(
  initialParamValues: T,
  fieldName: keyof T,
  touched: FormikTouched<T> | any,
  errors: FormikErrors<T> | any,
) => {
  const isFieldTouched = touched ? Boolean((touched as any)[fieldName]) : false;
  const hasError = errors ? (errors as any)[fieldName] : undefined;

  return Boolean(hasError && isFieldTouched);
};
