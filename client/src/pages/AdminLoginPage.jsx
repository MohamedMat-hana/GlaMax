/**
 * AdminLoginPage.jsx — Password-only admin login screen.
 * On success stores the bearer token via context and navigates to /admin/dashboard.
 * Shows a shake animation on wrong password.
 */

import { useState }      from 'react';
import { useNavigate }   from 'react-router-dom';
import { useUser }       from '../context/UserContext';
import { adminLogin }    from '../api/client';
import '../styles/global.css';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [error,    setError]    = useState('');
  const [shaking,  setShaking]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { setAdminToken } = useUser();
  const navigate          = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      // Support both standalone admin host (/dashboard) and embedded (/admin/dashboard)
      // VITE_ADMIN_BASE='/' on standalone admin host, '/admin' on client host
      const base = import.meta.env.VITE_ADMIN_BASE || '';
      navigate(base === '/' ? '/dashboard' : '/admin/dashboard');
    } catch {
      setError('كلمة المرور غير صحيحة');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className={`admin-login__card ${shaking ? 'admin-login__card--shake' : ''}`}>
        <div className="admin-login__icon">🔒</div>
        <h1 className="admin-login__logo">GLAMAX</h1>
        <p className="admin-login__sub">لوحة تحكم الأدمن</p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-login__field">
            <span className="admin-login__eye-icon">🔑</span>
            <input
              type={show ? 'text' : 'password'}
              className="admin-login__input"
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
            />
            <button
              type="button"
              className="admin-login__toggle"
              onClick={() => setShow(v => !v)}
              aria-label={show ? 'إخفاء' : 'إظهار'}
            >
              {show ? '🙈' : '👁'}
            </button>
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? '…' : 'دخول'}
          </button>

         </form>
      </div>
    </div>
  );
}
