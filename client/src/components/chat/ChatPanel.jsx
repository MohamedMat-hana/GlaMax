/**
 * ChatPanel.jsx — Instagram-style chat window.
 * Supports story reply cards and product inquiry cards as message context.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser }   from '../../context/UserContext';
import { useLang }   from '../../context/LangContext';
import { startChat, fetchMessages, sendMessage } from '../../api/client';
import './ChatPanel.css';

export const CHAT_ID_KEY   = 'glamax_chat_id';
export const CHAT_NAME_KEY = 'glamax_chat_name';
export const LAST_SEEN_KEY = 'glamax_last_seen_ts';

const POLL_MS = 4000;

export default function ChatPanel({ onClose }) {
  const { user } = useUser();
  const { lang } = useLang();

  const [chatId,          setChatId]          = useState(() => localStorage.getItem(CHAT_ID_KEY) || null);
  const [messages,        setMessages]        = useState([]);
  const [text,            setText]            = useState('');
  const [name,            setName]            = useState(user?.name || localStorage.getItem(CHAT_NAME_KEY) || '');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [started,         setStarted]         = useState(Boolean(localStorage.getItem(CHAT_ID_KEY)));
  // Product context attached to next message
  const [productCtx,      setProductCtx]      = useState(null); // { name, price, img }
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
  }, [messages]);

  const poll = useCallback(async () => {
    const id = localStorage.getItem(CHAT_ID_KEY);
    if (!id) return;
    const msgs = await fetchMessages(id).catch(err => {
      // If server restarted and chatId is gone, reset session
      if (err?.response?.status === 404) {
        localStorage.removeItem(CHAT_ID_KEY);
        setChatId(null);
        setStarted(false);
        setMessages([]);
      }
      return null;
    });
    if (msgs) setMessages(msgs);
  }, []);

  useEffect(() => {
    if (!started) return;
    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [started, poll]);

  // Read prefill from localStorage on mount (set by ProductCard before panel opens)
  useEffect(() => {
    const stored = localStorage.getItem('glamax_chat_prefill');
    if (stored) {
      try {
        const { text: t, product } = JSON.parse(stored);
        if (t)       setText(t);
        if (product) setProductCtx(product);
      } catch {}
      localStorage.removeItem('glamax_chat_prefill');
    }
  }, []);

  // Also listen for runtime event (e.g. dispatched while panel is already open)
  useEffect(() => {
    function handlePrefill(e) {
      if (e.detail?.text)    setText(e.detail.text);
      if (e.detail?.product) setProductCtx(e.detail.product);
    }
    window.addEventListener('glamax:chat-prefill', handlePrefill);
    return () => window.removeEventListener('glamax:chat-prefill', handlePrefill);
  }, []);

  async function handleStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const existingId = localStorage.getItem(CHAT_ID_KEY);
      const chat = await startChat({ chatId: existingId, userName: name.trim() });
      localStorage.setItem(CHAT_ID_KEY, chat.id);
      localStorage.setItem(CHAT_NAME_KEY, name.trim());
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      setChatId(chat.id);
      setMessages(chat.messages || []);
      setStarted(true);
    } catch {
      setError(lang === 'ar' ? 'تعذّر الاتصال، حاولي مرة أخرى' : 'Connection failed, please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const id = chatId || localStorage.getItem(CHAT_ID_KEY);
    if (!text.trim() || !id) return;
    try {
      const body = {
        text:    text.trim(),
        from:    'user',
        replyTo: productCtx
          ? { type: 'product', name: productCtx.name, price: productCtx.price, img: productCtx.img }
          : null
      };
      const msg = await sendMessage(id, body);
      setMessages(prev => [...prev, msg]);
      setText('');
      setProductCtx(null); // clear after send
    } catch {
      setError(lang === 'ar' ? 'فشل الإرسال' : 'Failed to send');
    }
  }

  const storedName = name || localStorage.getItem(CHAT_NAME_KEY) || '';

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-panel__header">
        <img src="/logo.jpg" alt="Glamax" className="chat-panel__avatar" />
        <div className="chat-panel__header-info">
          <p className="chat-panel__name">Glamax CRS</p>
          <p className="chat-panel__sub">
            {lang === 'ar' ? '❤️ نردّ في أسرع وقت' : '❤️ We reply as fast as we can'}
          </p>
        </div>
        <button className="chat-panel__close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {!started ? (
        <form className="chat-panel__gate" onSubmit={handleStart}>
          <div className="chat-panel__gate-icon">💬</div>
          <p className="chat-panel__gate-msg">
            {lang === 'ar' ? 'أهلاً! أدخلي اسمك للبدء في المحادثة' : 'Hi! Enter your name to start chatting'}
          </p>
          <input
            className="chat-panel__gate-input"
            placeholder={lang === 'ar' ? 'اسمك…' : 'Your name…'}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="chat-panel__error">{error}</p>}
          <button type="submit" className="chat-panel__gate-btn" disabled={loading || !name.trim()}>
            {loading ? '⏳' : lang === 'ar' ? 'ابدأ المحادثة ←' : 'Start chat →'}
          </button>
        </form>
      ) : (
        <>
          <div className="chat-panel__messages">
            {/* Welcome bubble */}
            <div className="chat-msg chat-msg--admin">
              <div className="chat-msg__bubble">
                {lang === 'ar'
                  ? `أهلاً ${storedName}! 🌸 كيف أقدر أساعدك اليوم؟`
                  : `Hi ${storedName}! 🌸 How can I help you today?`}
              </div>
              <span className="chat-msg__label">Glamax CRS 👑</span>
            </div>

            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg chat-msg--${msg.from}`}>

                {/* Story reply card */}
                {msg.replyTo?.type === 'story' && (
                  <div className="chat-reply-card">
                    {msg.replyTo.img
                      ? <img src={msg.replyTo.img} alt="" className="chat-reply-card__img" />
                      : <div className="chat-reply-card__empty">✨</div>
                    }
                    <div className="chat-reply-card__footer">
                      <span className="chat-reply-card__label">
                        {lang === 'ar' ? '↩ ردّ على الستوري' : '↩ Story reply'}
                      </span>
                      <span className="chat-reply-card__title">{msg.replyTo.title}</span>
                    </div>
                  </div>
                )}

                {/* Product inquiry card */}
                {msg.replyTo?.type === 'product' && (
                  <div className="chat-reply-card">
                    {msg.replyTo.img
                      ? <img src={msg.replyTo.img} alt="" className="chat-reply-card__img" />
                      : <div className="chat-reply-card__empty">🛍</div>
                    }
                    <div className="chat-reply-card__footer">
                      <span className="chat-reply-card__label">
                        {lang === 'ar' ? '🛍 استفسار عن منتج' : '🛍 Product inquiry'}
                      </span>
                      <span className="chat-reply-card__title">{msg.replyTo.name}</span>
                      <span className="chat-reply-card__sub">{msg.replyTo.price}</span>
                    </div>
                  </div>
                )}

                <div className="chat-msg__bubble">{msg.text}</div>
                <span className="chat-msg__time">
                  {new Date(msg.ts).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            ))}

            {error && <p className="chat-panel__error chat-panel__error--inline">{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Product context preview above input */}
          {productCtx && (
            <div className="chat-panel__product-preview">
              {productCtx.img
                ? <img src={productCtx.img} alt="" className="chat-panel__product-preview-img" />
                : <span>✨</span>
              }
              <div className="chat-panel__product-preview-info">
                <span className="chat-panel__product-preview-label">
                  {lang === 'ar' ? '🛍 استفسار عن منتج' : '🛍 Product inquiry'}
                </span>
                <span className="chat-panel__product-preview-name">{productCtx.name}</span>
                <span className="chat-panel__product-preview-price">{productCtx.price}</span>
              </div>
              <button className="chat-panel__product-preview-close" onClick={() => setProductCtx(null)}>✕</button>
            </div>
          )}

          <form className="chat-panel__input-row" onSubmit={handleSend}>
            <button type="submit" className="chat-panel__send-btn" disabled={!text.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>
            <input
              className="chat-panel__input"
              placeholder={lang === 'ar' ? 'اكتبي رسالتك…' : 'Type a message…'}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
}
