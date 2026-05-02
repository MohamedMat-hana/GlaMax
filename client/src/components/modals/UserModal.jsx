/**
 * UserModal.jsx — User session modal: enter name + optional email.
 * If logged in, shows profile and a logout button.
 * Fully bilingual via useLang().
 */

import { useState, useEffect } from 'react';
import { useUser }   from '../../context/UserContext';
import { useLang }   from '../../context/LangContext';
import { fetchUser } from '../../api/client';
import Avatar        from '../ui/Avatar';
import './UserModal.css';

/**
 * @param {{ onClose: () => void }} props
 */
export default function UserModal({ onClose }) {
  const { user, login, logout } = useUser();
  const { t }                   = useLang();
  const [name,   setName]   = useState(user?.name  || '');
  const [email,  setEmail]  = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  async function handleEmailBlur() {
    if (!email) return;
    try {
      const profile = await fetchUser(email);
      if (profile?.name) setName(profile.name);
    } catch {}
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await login({ name: name.trim(), email: email.trim() });
    setSaving(false);
    onClose();
  }

  function handleLogout() {
    logout();
    onClose();
  }

  return (
    <div className="um-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="um-card" onClick={e => e.stopPropagation()}>
        <button className="um-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="um-title">
          {user ? t('yourProfile') : t('writeYourName')}
        </h2>

        {user && (
          <div className="um-profile">
            <Avatar name={user.name} size={52} />
            <div>
              <p className="um-profile__name">{user.name}</p>
              {user.email && <p className="um-profile__email">{user.email}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="um-form">
          <label className="um-label">
            {t('nameLabel')}
            <input
              className="um-input"
              placeholder={t('namePh')}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="um-label">
            {t('emailLabel')}
            <input
              className="um-input"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
            />
          </label>

          <div className="um-actions">
            {user && (
              <button type="button" className="um-btn um-btn--logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}
            <button type="submit" className="um-btn um-btn--save" disabled={saving}>
              {saving ? '…' : t('save')}
            </button>
          </div>
        </form>

        <p className="um-hint">{t('emailHint')}</p>
      </div>
    </div>
  );
}
