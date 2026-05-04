/**
 * Convert a duration in minutes to a human-readable string.
 *   90 → "1h 30m"
 *   45 → "45m"
 *   125 → "2h 5m"
 */
export const formatDuration = (minutes) => {
  if (minutes == null || isNaN(minutes)) return "—";
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
};

/** "HH:mm" → minutes since midnight */
export const minutesFromTimeString = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/** Difference between two HH:mm times, wrapping past midnight */
export const durationBetween = (depHHmm, arrHHmm) => {
  const a = minutesFromTimeString(depHHmm);
  const b = minutesFromTimeString(arrHHmm);
  if (a == null || b == null) return null;
  let diff = b - a;
  if (diff < 0) diff += 24 * 60;
  return diff;
};
