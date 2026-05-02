/**
 * avatarColor.js — Deterministically maps a name string to an HSL background color.
 * Same name always produces the same hue, ensuring consistent avatar colors.
 */

/**
 * Hashes a string to a number in [0, 360) for use as an HSL hue.
 * @param {string} str
 * @returns {number} hue value
 */
function hashHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Returns a CSS HSL color string based on the first character of the name.
 * @param {string} name
 * @returns {{ bg: string, text: string }}
 */
export function avatarColor(name = '?') {
  const hue = hashHue(name);
  return {
    bg:   `hsl(${hue}, 55%, 28%)`,
    text: `hsl(${hue}, 80%, 88%)`
  };
}

/**
 * Returns the first character (uppercase) to display inside the avatar circle.
 * @param {string} name
 * @returns {string}
 */
export function avatarInitial(name = '?') {
  return (name.trim()[0] || '?').toUpperCase();
}
