/**
 * getImageUrl — Converts a relative /uploads/... path to an absolute URL.
 * In production the images are served from the Render backend (VITE_API_URL).
 * In dev the Vite proxy handles /uploads → localhost:4000.
 */

const API = import.meta.env.VITE_API_URL || '';

export function getImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http')) return img;   // already absolute
  // In dev API is '' so path stays relative (proxied by Vite)
  return `${API}${img}`;
}
