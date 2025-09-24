import { formatDate } from "date-fns";

export function sameDates(d1: Date, d2: Date) {
  return formatDate(d1, "PPP") === formatDate(d2, "PPP");
}
