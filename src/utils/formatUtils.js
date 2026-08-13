export function safeFormatUnderscoreToCapitalize(value = '') {
  if (!value || typeof value !== 'string') return '';

  return value
    .replace(/_/g, ' ') // replace underscores with space
    .replace(/\s+/g, ' ') // avoid double spaces
    .trim() // remove leading/trailing spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}
