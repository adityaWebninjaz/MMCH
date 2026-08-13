export const trimText = (text, max = 20) => {
  if (!text) return 'Not Available (N/A)';
  return text.length > max ? text.substring(0, max) + '...' : text;
};
