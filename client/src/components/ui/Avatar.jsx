/**
 * Avatar.jsx — Circular avatar with an initial letter and deterministic background color.
 * Admin avatars render with a golden crown icon instead.
 */

import { avatarColor, avatarInitial } from '../../utils/avatarColor';
import './Avatar.css';

/**
 * @param {{ name: string, isAdmin?: boolean, size?: number }} props
 */
export default function Avatar({ name = '?', isAdmin = false, size = 36 }) {
  const { bg, text } = avatarColor(name);

  if (isAdmin) {
    return (
      <span
        className="avatar avatar--admin"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        title="Glamax CRS 👑"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: bg, color: text, fontSize: size * 0.42 }}
      title={name}
    >
      {avatarInitial(name)}
    </span>
  );
}
