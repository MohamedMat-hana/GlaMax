/**
 * StoryReplyModal.jsx — In-app story reply form.
 * After sending, the reply is also added to the user's chat so the conversation
 * continues there. Shows an "open chat" link on success.
 */

import { useState }       from 'react';
import { useLang }        from '../../context/LangContext';
import { useUser }        from '../../context/UserContext';
import { sendStoryReply, startChat, sendMessage } from '../../api/client';
import { CHAT_ID_KEY, CHAT_NAME_KEY, LAST_SEEN_KEY } from '../chat/ChatPanel';
import './StoryReplyModal.css';

/**
 * @param {{ story: object, onClose: () => void, onOpenChat?: () => void }} props
 */
export default function StoryReplyModal({ story, onClose, onOpenChat }) {
  const { t, lang } = useLang();
  const { user }    = useUser();

  const [name,    setName]    = useState(user?.name || localStorage.getItem(CHAT_NAME_KEY) || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    try {
      // 1. Save story reply
      await sendStoryReply({
        storyId:      story.id,
        storyTitleAr: story.titleAr || story.title || '',
        storyTitleEn: story.titleEn || story.title || '',
        storyImg:     story.img     || '',
        senderName:   name.trim(),
        message:      message.trim()
      });

      // 2. Also send as a chat message so conversation continues in chat
      try {
        const existingId = localStorage.getItem(CHAT_ID_KEY);
        const chat = await startChat({ chatId: existingId, userName: name.trim() });
        localStorage.setItem(CHAT_ID_KEY, chat.id);
        localStorage.setItem(CHAT_NAME_KEY, name.trim());

        // title is already the localised string (passed as story.title from StoriesViewer)
        await sendMessage(chat.id, {
          text:    message.trim(),
          from:    'user',
          replyTo: {
            type:    'story',
            title:   story.title || story.titleAr || story.titleEn || '',
            img:     story.img   || ''
          }
        });
        localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      } catch {} // chat linking is best-effort

      setSent(true);
      // Auto-close after 3s if user doesn't open chat
      setTimeout(onClose, 3000);
    } catch {
      setSending(false);
    }
  }

  function handleOpenChat() {
    onClose();
    onOpenChat?.();
  }

  return (
    <div className="srm-backdrop" onClick={sent ? undefined : onClose}>
      <div className="srm-sheet" onClick={e => e.stopPropagation()}>

        {!sent ? (
          <>
            <button className="srm-close" onClick={onClose} aria-label="Close">✕</button>

            {/* Story preview */}
            <div className="srm-story-info">
              {story.img
                ? <img src={story.img} alt="" className="srm-story-thumb" />
                : <span className="srm-story-emoji">✨</span>
              }
              <div>
                <p className="srm-story-label">{t('replyFormTitle')}</p>
                <p className="srm-story-title">{story.title}</p>
              </div>
            </div>

            <form className="srm-form" onSubmit={handleSend}>
              {!user && (
                <input
                  className="srm-input"
                  placeholder={t('replyNamePh')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus={!user}
                />
              )}

              <textarea
                className="srm-textarea"
                placeholder={t('replyMsgPh')}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
                autoFocus={Boolean(user)}
              />

              <button
                type="submit"
                className="srm-send-btn"
                disabled={sending || !message.trim() || !name.trim()}
              >
                {sending ? '⏳' : t('sendReply')}
              </button>
            </form>
          </>
        ) : (
          /* ── Success state ── */
          <div className="srm-success">
            <span className="srm-success__icon">💌</span>
            <p className="srm-success__title">{t('replySent')}</p>
            <p className="srm-success__sub">{t('replySentSub')}</p>

            {/* Open chat button */}
            <button className="srm-open-chat-btn" onClick={handleOpenChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {lang === 'ar' ? 'فتح المحادثة' : 'Open chat'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
