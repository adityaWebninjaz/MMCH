export const camelToCapitalized = (str = '') => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1') // add space before capital letters
    .replace(/^./, (char) => char.toUpperCase()) // capitalize first letter
    .trim();
};
