/**
 * timeAgo.js — Converts a Unix timestamp to a human-readable Arabic relative time.
 * Examples: "الآن", "5 د", "3 س", "2 ي"
 */

/**
 * Returns an Arabic relative-time string for the given timestamp.
 * @param {number} ts - Unix timestamp in milliseconds
 * @returns {string}
 */
export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const s    = Math.floor(diff / 1000);
  const m    = Math.floor(s / 60);
  const h    = Math.floor(m / 60);
  const d    = Math.floor(h / 24);

  if (s < 60)  return 'الآن';
  if (m < 60)  return `${m} د`;
  if (h < 24)  return `${h} س`;
  if (d < 30)  return `${d} ي`;
  return new Date(ts).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}
