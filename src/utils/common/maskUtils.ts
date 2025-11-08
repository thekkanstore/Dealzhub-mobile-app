export const maskEmail = (email: string): string => {
  if (!email) return '';

  const [name, domain] = email.split('@');
  if (name.length <= 3) {
    return `${name.slice(0, 1)}*****@${domain}`;
  }
  return `${name.slice(0, 3)}*****@${domain}`;
};
