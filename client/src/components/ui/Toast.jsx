/**
 * Toast.jsx — Temporary notification banner that auto-dismisses after 3 seconds.
 * Used throughout the app via a simple imperative show() callback.
 */

import { useState, useEffect, useCallback } from 'react';
import './Toast.css';

/**
 * @param {{ message: string, type?: 'success'|'error'|'info' }} props
 */
export default function Toast({ message, type = 'success' }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div className={`toast toast--${type}`} role="alert">
      {type === 'success' && '✓ '}
      {type === 'error'   && '✕ '}
      {message}
    </div>
  );
}

/**
 * useToast — Returns a { message, type, show } tuple for controlling a Toast.
 * Pair with <Toast message={message} type={type} />.
 */
export function useToast() {
  const [state, setState] = useState({ message: '', type: 'success' });

  const show = useCallback((message, type = 'success') => {
    setState({ message: '', type });
    setTimeout(() => setState({ message, type }), 10);
  }, []);

  return { ...state, show };
}
