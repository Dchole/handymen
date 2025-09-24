import {
  formatDate,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays
} from "date-fns";

export function readableDateFormat(
  date: string | Date,
  includeConjunction = false
): string {
  const dateObj = new Date(date);
  const timeFormat = includeConjunction ? " 'at' h:mm a" : " h:mm a";

  if (isToday(dateObj)) {
    return `today${timeFormat ? formatDate(dateObj, timeFormat) : ""}`;
  }

  if (isTomorrow(dateObj)) {
    return `tomorrow${timeFormat ? formatDate(dateObj, timeFormat) : ""}`;
  }

  if (isYesterday(dateObj)) {
    return `yesterday${timeFormat ? formatDate(dateObj, timeFormat) : ""}`;
  }

  const daysDiff = Math.abs(differenceInDays(dateObj, new Date()));

  if (daysDiff <= 7) {
    return formatDate(dateObj, `EEEE${timeFormat}`);
  }

  if (dateObj.getFullYear() === new Date().getFullYear()) {
    return formatDate(dateObj, `MMMM d${timeFormat}`);
  }

  return formatDate(dateObj, `MMMM d, yyyy${timeFormat}`);
}
