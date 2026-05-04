import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";

const toDate = (input) => {
  if (!input) return null;
  if (input instanceof Date) return input;
  if (typeof input === "string") return parseISO(input);
  return new Date(input);
};

/** "12 May 2026" */
export const formatDate = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "d MMM yyyy");
};

/** "Sat, 12 May" */
export const formatShortDate = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "EEE, d MMM");
};

/** "12 May 2026 · 14:32" */
export const formatDateTime = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "d MMM yyyy · HH:mm");
};

/** "14:32" */
export const formatTime = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "HH:mm");
};

/** "Today" / "Tomorrow" / "12 May" */
export const formatRelativeDay = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM");
};

/** ISO string limited to date portion (YYYY-MM-DD) */
export const toISODate = (input) => {
  const d = toDate(input);
  if (!d || isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
};
