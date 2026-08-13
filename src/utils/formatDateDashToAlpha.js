export const formatDateDashToAlpha = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatted = `${day}-${monthNames[parseInt(month) - 1]}-${year}`;
  return formatted;
};