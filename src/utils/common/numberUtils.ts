export const removeLeading = (value: string): string => {
  return value.replace(/^0+/, '');
};
export const onlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const onlyDecimalNumbers = (value: string): string => {
  let cleaned = value.replace(/[^0-9.]/g, '');

  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    cleaned =
      cleaned.substring(0, dotIndex + 1) + cleaned.substring(dotIndex + 1).replace(/\./g, '');
  }

  if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
    cleaned = cleaned.replace(/^0+/, '');
  }

  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

export const convertRupeesToPaise = (rupees: string) => {
  return Math.round(Number(rupees) * 100);
};

export const padNumberWithZero = (number: number): string => number.toString().padStart(2, '0');
