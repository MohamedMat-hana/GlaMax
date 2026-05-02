/**
 * ChatBubble.jsx — Floating chat button with unread badge.
 * Click-outside closes the panel. Polls for admin replies every 8s.
 */

import { useState, useEffect, useRef } from 'react';
import { fetchMessages }               from '../../api/client';
import ChatPanel, { CHAT_ID_KEY, LAST_SEEN_KEY } from './ChatPanel';
import './ChatBubble.css';

const POLL_MS = 8000;

export default function ChatBubble() {
  const [open,        setOpen]        = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef    = useRef(null);
  const wrapperRef = useRef(null); // wraps both the panel and the button

  // Count admin messages newer than last-seen
  async function checkUnread() {
    const chatId = localStorage.getItem(CHAT_ID_KEY);
    if (!chatId) return;
    const msgs     = await fetchMessages(chatId).catch(() => []);
    const lastSeen = parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10);
    setUnreadCount(msgs.filter(m => m.from === 'admin' && m.ts > lastSeen).length);
  }

  useEffect(() => {
    checkUnread();
    pollRef.current = setInterval(checkUnread, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, []);

  // Close panel when clicking outside the wrapper
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // Listen for story-reply modal's "open chat" event
  useEffect(() => {
    function handleExternalOpen() {
      setOpen(true);
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      setUnreadCount(0);
    }
    window.addEventListener('glamax:open-chat', handleExternalOpen);
    return () => window.removeEventListener('glamax:open-chat', handleExternalOpen);
  }, []);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      setUnreadCount(0);
    }
  }

  return (
    <div ref={wrapperRef} className="chat-bubble-wrapper">
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      <button
        className={`chat-bubble ${open ? 'chat-bubble--active' : ''}`}
        onClick={handleOpen}
        aria-label="Open chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}

        {!open && unreadCount > 0 && (
          <span className="chat-bubble__badge">{unreadCount}</span>
        )}
      </button>
    </div>
  );
}
