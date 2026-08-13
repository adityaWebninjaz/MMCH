// Always returns date in format: DD Mon YYYY (e.g., 29 Oct 2025)
export default function formatDate(input) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: '2-digit' }); // e.g., "Oct"
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
