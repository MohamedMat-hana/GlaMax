/**
 * CommentItem.jsx — A single comment row with avatar, text, like/reply buttons,
 * and an expandable reply thread below. Fully bilingual via useLang().
 */

import { useState }  from 'react';
import Avatar        from '../ui/Avatar';
import ReplyItem     from './ReplyItem';
import { timeAgo }   from '../../utils/timeAgo';
import { useUser }   from '../../context/UserContext';
import { useLang }   from '../../context/LangContext';
import './CommentItem.css';

export default function CommentItem({
  comment, onLike, onDelete,
  onAddReply, onLikeReply, onDeleteReply
}) {
  const { user, adminToken } = useUser();
  const { t }                = useLang();
  // admin UI only when adminToken is present
  const isAdmin              = Boolean(adminToken);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyName, setReplyName] = useState(user?.name || '');
  const [replyText, setReplyText] = useState('');
  const [sending,   setSending]   = useState(false);

  async function submitReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !replyName.trim()) return;
    setSending(true);
    await onAddReply(replyName.trim(), replyText.trim());
    setReplyText('');
    setReplyOpen(false);
    setSending(false);
  }

  return (
    <div className="comment-item">
      <Avatar name={comment.name} isAdmin={comment.isAdmin} size={36} />

      <div className="comment-item__body">
        <div className="comment-item__header">
          <span className="comment-item__name">
            {comment.name}
            {comment.isAdmin && <span className="comment-item__crown">👑 الصفحة</span>}
          </span>
          <span className="comment-item__time">{timeAgo(comment.ts)}</span>
        </div>

        <p className="comment-item__text">{comment.text}</p>

        <div className="comment-item__actions">
          <button className="comment-item__like-btn" onClick={onLike}>
            ♥ {comment.likes || 0}
          </button>
          <button className="comment-item__reply-btn" onClick={() => setReplyOpen(v => !v)}>
            {t('reply')}
          </button>
          {isAdmin && (
            <button className="comment-item__del-btn" onClick={onDelete} aria-label="Delete">🗑</button>
          )}
        </div>

        {replyOpen && (
          <form className="comment-item__reply-form" onSubmit={submitReply}>
            {!user && (
              <input
                className="comment-item__reply-name"
                placeholder={t('yourName')}
                value={replyName}
                onChange={e => setReplyName(e.target.value)}
                required
              />
            )}
            <div className="comment-item__reply-row">
              <button type="submit" className="comment-item__reply-send" disabled={sending}>↵</button>
              <input
                className="comment-item__reply-input"
                placeholder={t('addReply')}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                required
              />
            </div>
          </form>
        )}

        {(comment.replies || []).map(reply => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            onLike={() => onLikeReply(reply.id)}
            onDelete={() => onDeleteReply(reply.id)}
          />
        ))}
      </div>
    </div>
  );
}
