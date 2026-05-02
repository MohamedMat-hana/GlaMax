/**
 * ReplyItem.jsx — A single nested reply under a comment.
 * Admin replies show a golden crown avatar. Delete is admin-only.
 */

import Avatar        from '../ui/Avatar';
import { timeAgo }   from '../../utils/timeAgo';
import { useUser }   from '../../context/UserContext';
import './ReplyItem.css';

/**
 * @param {{ reply: object, onLike: () => void, onDelete: () => void }} props
 */
export default function ReplyItem({ reply, onLike, onDelete }) {
  const { isAdmin } = useUser();

  return (
    <div className="reply-item">
      <Avatar name={reply.name} isAdmin={reply.isAdmin} size={28} />

      <div className="reply-item__body">
        <div className="reply-item__header">
          <span className="reply-item__name">
            {reply.name}
            {reply.isAdmin && <span className="reply-item__crown">👑 الصفحة</span>}
          </span>
          <span className="reply-item__time">{timeAgo(reply.ts)}</span>
        </div>

        <p className="reply-item__text">{reply.text}</p>

        <div className="reply-item__actions">
          <button className="reply-item__like-btn" onClick={onLike}>
            ♥ {reply.likes || 0}
          </button>
          {isAdmin && (
            <button className="reply-item__del-btn" onClick={onDelete} aria-label="حذف">
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
