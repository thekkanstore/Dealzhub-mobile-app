export const shouldShowError = <T extends object>(
  initialParamValues: T,
  fieldName: keyof T,
  touched: Partial<Record<keyof T, boolean>>,
  errors: Partial<Record<keyof T, string>>,
) => {
  const isFieldTouched = touched[fieldName];
  const hasError = errors[fieldName];

  return hasError && isFieldTouched;
};
