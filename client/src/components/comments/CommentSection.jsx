/**
 * CommentSection.jsx — Full comment thread for one product.
 * Includes an add-comment form and a list of CommentItems.
 * If the user is not logged in, shows a name input above the comment box.
 */

import { useState, useEffect }  from 'react';
import { useUser }              from '../../context/UserContext';
import { useLang }              from '../../context/LangContext';
import { useComments }          from '../../hooks/useComments';
import CommentItem              from './CommentItem';
import './CommentSection.css';

/**
 * @param {{ productId: string, onCountChange?: (n: number) => void, isAdmin?: boolean }} props
 */
export default function CommentSection({ productId, onCountChange, isAdmin: forceAdmin }) {
  const { user, adminToken } = useUser();
  const { t }                = useLang();
  const isAdmin              = Boolean(forceAdmin);

  const {
    comments, loading,
    addComment, removeComment, toggleLikeComment,
    addReply,   removeReply,   toggleLikeReply
  } = useComments(productId);

  const [name,    setName]    = useState(user?.name || '');
  const [text,    setText]    = useState('');
  const [sending, setSending] = useState(false);

  // Notify parent of comment count changes
  useEffect(() => {
    onCountChange?.(comments.length);
  }, [comments.length, onCountChange]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    setSending(true);
    await addComment({ name: isAdmin ? 'Glamax CRS' : name.trim(), text: text.trim(), isAdmin });
    setText('');
    setSending(false);
  }

  return (
    <div className="comment-section">
      {/* Add comment form */}
      <form className="cs-form" onSubmit={submit}>
        {!user && !isAdmin && (
          <input
            className="cs-input"
            placeholder={t('yourName')}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        )}

        <div className="cs-form__row">
          <button type="submit" className="cs-send-btn" disabled={sending} aria-label={t('send')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
          <input
            className="cs-input cs-input--comment"
            placeholder={isAdmin ? t('adminCommentPh') : t('addComment')}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
            required
          />
        </div>
      </form>

      {/* Comment list */}
      {loading && <p className="cs-state">{t('loading')}</p>}

      {!loading && comments.length === 0 && (
        <p className="cs-state">{t('noComments')}</p>
      )}

      <div className="cs-list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={() => toggleLikeComment(comment.id)}
            onDelete={() => removeComment(comment.id, adminToken)}
            onAddReply={(rName, rText) =>
              addReply(comment.id, {
                name: isAdmin ? 'Glamax CRS' : rName,
                text: rText,
                isAdmin
              })
            }
            onLikeReply={replyId => toggleLikeReply(comment.id, replyId)}
            onDeleteReply={replyId => removeReply(comment.id, replyId, adminToken)}
          />
        ))}
      </div>
    </div>
  );
}
