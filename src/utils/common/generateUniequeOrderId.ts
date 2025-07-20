export const shuffleString = (str: string) => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

export const generateUniequeOrderSKUId = () => {
  const randomNum = Math.floor(Math.random() * 100);
  const randomStr = Math.random().toString(10).substring(2, 10);
  return `SKU${shuffleString(`${randomNum}${randomStr}`)}`;
};

export const generateUniqueOrderId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100);
  const shuffledString = shuffleString(`${randomNum}`);
  return `ORD${timestamp}${shuffledString}`;
};
