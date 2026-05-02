/**
 * Header.jsx — Sticky top header with the GLAMAX CRS logo and user chip.
 * Clicking the chip opens the UserModal when not logged in,
 * or shows a logout option when logged in.
 */

import { useState }   from 'react';
import { useUser }    from '../../context/UserContext';
import { useLang }    from '../../context/LangContext';
import Avatar         from '../ui/Avatar';
import UserModal      from '../modals/UserModal';
import './Header.css';

export default function Header() {
  const { user }           = useUser();
  const { lang, toggle, t } = useLang();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header__logo">
          <img src="/logo.jpg" alt="Glamax CRS" className="header__logo-img" />
          <span className="header__logo-text">GLAMAX <span className="header__logo-sub">CRS</span></span>
        </div>

        <div className="header__right">
          {/* Language toggle */}
          <button className="header__lang" onClick={toggle} aria-label="Switch language">
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>

          {/* User chip */}
          {user ? (
            <button className="header__chip" onClick={() => setModalOpen(true)}>
              <Avatar name={user.name} size={30} />
              <span>{user.name}</span>
            </button>
          ) : (
            <button className="header__chip header__chip--guest" onClick={() => setModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{t('enterName')}</span>
            </button>
          )}
        </div>
      </header>

      {modalOpen && <UserModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
