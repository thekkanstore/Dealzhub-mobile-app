export const shouldShowError = <T extends object>(
  initialParamValues: T,
  fieldName: keyof T,
  touched: Partial<Record<keyof T, boolean>>,
  errors: Partial<Record<keyof T, string>>,
) => {
  const hasInitialValues = Object.keys(initialParamValues).length > 0;
  const isFieldTouched = touched[fieldName];
  const hasError = errors[fieldName];

  return hasError && (isFieldTouched || hasInitialValues);
};
