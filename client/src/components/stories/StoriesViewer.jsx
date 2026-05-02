/**
 * StoriesViewer.jsx — Full-screen Instagram-style story viewer.
 * Progress bars at top, username header, tap zones for prev/next,
 * and a bottom bar with reply input + like + share buttons.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang }       from '../../context/LangContext';
import { getImageUrl }   from '../../utils/getImageUrl';
import StoryReplyModal   from './StoryReplyModal';
import './StoriesViewer.css';

const IG_USER = import.meta.env.VITE_IG_USER || 'glamaxcrs';
const TICK    = 50; // ms per progress tick

/**
 * @param {{ stories: Array, startIndex: number, onClose: () => void }} props
 */
export default function StoriesViewer({ stories, startIndex = 0, onClose }) {
  const { lang, t }                       = useLang();
  const [index,      setIndex]            = useState(startIndex);
  const [progress,   setProgress]         = useState(0);
  const [paused,     setPaused]           = useState(false);
  const [liked,      setLiked]            = useState(false);
  const [replyOpen,  setReplyOpen]        = useState(false);
  const [toast,      setToast]            = useState('');
  const intervalRef                       = useRef(null);
  const story                             = stories[index];
  const storyTitle = story
    ? (lang === 'en' ? (story.titleEn || story.titleAr || story.title || '') : (story.titleAr || story.title || ''))
    : '';

  /** Move to next story or close when last */
  const next = useCallback(() => {
    setProgress(0);
    setLiked(false);
    setIndex(i => {
      if (i + 1 >= stories.length) { onClose(); return i; }
      return i + 1;
    });
  }, [stories.length, onClose]);

  /** Move to previous story */
  const prev = useCallback(() => {
    setProgress(0);
    setLiked(false);
    setIndex(i => Math.max(0, i - 1));
  }, []);

  // Animated progress ticker — pauses when reply modal is open or paused
  useEffect(() => {
    if (paused || replyOpen) return;
    const duration = story?.duration || 5000;
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next_ = p + TICK / duration;
        if (next_ >= 1) { clearInterval(intervalRef.current); next(); return 1; }
        return next_;
      });
    }, TICK);
    return () => clearInterval(intervalRef.current);
  }, [index, paused, replyOpen, story, next]);

  // Reset progress + liked when story changes
  useEffect(() => { setProgress(0); setLiked(false); }, [index]);

  // Escape key closes viewer
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  /** Toggle local like (visual only — no server call) */
  function handleLike() {
    setLiked(v => !v);
    setPaused(true);
    setTimeout(() => setPaused(false), 800);
  }

  /** Share — Web Share API → fallback copy link */
  async function handleShare() {
    setPaused(true);
    const url  = window.location.href;
    const text = `${story.title} — Glamax CRS`;
    if (navigator.share) {
      await navigator.share({ title: text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setToast(t('linkCopied'));
    }
    setTimeout(() => setPaused(false), 500);
  }

  if (!story) return null;

  return (
    <div className="sv-overlay" role="dialog" aria-modal="true">

      {/* ── Full-screen background image ── */}
      <div className="sv-bg">
        {story.img
          ? <img src={getImageUrl(story.img)} alt={story.title} className="sv-bg__img" />
          : <div className="sv-bg__empty"><span>✨</span><p>{storyTitle}</p></div>
        }
        {/* subtle dark gradient so header/footer text is readable */}
        <div className="sv-bg__scrim-top" />
        <div className="sv-bg__scrim-bottom" />
      </div>

      {/* ── Progress bars ── */}
      <div className="sv-progress">
        {stories.map((s, i) => (
          <div key={s.id} className="sv-progress__track">
            <div
              className="sv-progress__fill"
              style={{
                transform:       `scaleX(${i < index ? 1 : i === index ? progress : 0})`,
                transformOrigin: 'left'
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="sv-header">
        <div className="sv-header__info">
          <div className="sv-header__ring">
            {story.img
              ? <img src={getImageUrl(story.img)} alt="" className="sv-header__thumb" />
              : <span>✨</span>
            }
          </div>
          <div>
            <p className="sv-header__name">glamaxcrs</p>
            <p className="sv-header__sub">{storyTitle}</p>
          </div>
        </div>

        <div className="sv-header__actions">
          <button
            className="sv-header__pause"
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? 'Play' : 'Pause'}
          >
            {paused
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            }
          </button>
          <button className="sv-header__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      {/* ── Tap zones ── */}
      <button className="sv-tap sv-tap--prev" onClick={prev} aria-label="Previous" />
      <button className="sv-tap sv-tap--next" onClick={next} aria-label="Next" />

      {/* ── Bottom bar (Instagram style) ── */}
      <div className="sv-bottom">
        <button
          className="sv-bottom__reply-input"
          onClick={() => { setPaused(true); setReplyOpen(true); }}
        >
          <span>{t('replyTo', 'glamaxcrs')}</span>
        </button>

        <button
          className={`sv-bottom__like ${liked ? 'sv-bottom__like--active' : ''}`}
          onClick={handleLike}
          aria-label={t('like')}
        >
          <svg width="26" height="26" viewBox="0 0 24 24"
            fill={liked ? '#ff4d6d' : 'none'}
            stroke={liked ? '#ff4d6d' : 'white'}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <button className="sv-bottom__share" onClick={handleShare} aria-label={t('share')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && <div className="sv-toast">{toast}</div>}

      {/* ── Reply modal (pauses story) ── */}
      {replyOpen && (
        <StoryReplyModal
          story={{ ...story, title: storyTitle }}
          onClose={() => { setReplyOpen(false); setPaused(false); }}
          onOpenChat={() => {
            setReplyOpen(false);
            onClose();
            // Dispatch a custom event so ChatBubble opens itself
            window.dispatchEvent(new CustomEvent('glamax:open-chat'));
          }}
        />
      )}
    </div>
  );
}
