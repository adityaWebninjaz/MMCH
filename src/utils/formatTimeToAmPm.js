export const formatTimeToAmPm = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return '';

  // Match HH:mm or H:mm (24-hour style)
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr; // return original if invalid

  let [_, hours, minutes] = match;
  hours = Number(hours);
  minutes = Number(minutes);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeStr;

  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;

  return `${adjustedHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const formatDateTime12Hour = (dateTime) => {
  if (!dateTime) return "-";

  // "2026-07-08T21:36:42Z"
  const [datePart, timePart] = dateTime.replace("Z", "").split("T");

  const [year, month, day] = datePart.split("-");
  let [hours, minutes] = timePart.split(":");

  hours = Number(hours);

  const amPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = String(hours % 12 || 12).padStart(2, "0");

  return `${day}-${month}-${year}, ${formattedHours}:${minutes} ${amPm}`;
};

export const formatGatePassType = (type) => {
  if (!type) return "";

  return type
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};