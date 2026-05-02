/**
 * AdminDashboard.jsx — Admin panel with notifications, bilingual product/story forms,
 * and three tabs: Products, Stories, Comments.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }          from 'react-router-dom';
import { useUser }              from '../context/UserContext';
import { useProducts }          from '../hooks/useProducts';
import { useStories }           from '../hooks/useStories';
import CommentSection           from '../components/comments/CommentSection';
import UploadZone               from '../components/ui/UploadZone';
import Toast, { useToast }      from '../components/ui/Toast';
import { fetchNotifications, markNotificationsRead, fetchStoryReplies,
         fetchAllChats, fetchMessages, sendMessage, markChatRead } from '../api/client';
import '../styles/global.css';
import '../components/chat/ChatPanel.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate                     = useNavigate();
  const { adminToken, setAdminToken } = useUser();
  const [tab, setTab]                = useState(0);
  const [notes, setNotes]            = useState([]);
  const [bellOpen, setBellOpen]      = useState(false);
  const { message, type, show }      = useToast();
  const bellWrapRef                  = useRef(null);

  const base           = import.meta.env.VITE_ADMIN_BASE || '';
  const adminLoginPath = base === '/' ? '/' : '/admin';

  useEffect(() => {
    if (!adminToken) navigate(adminLoginPath);
  }, [adminToken, navigate]);

  // Poll notifications every 12 seconds
  const loadNotes = useCallback(async () => {
    if (!adminToken) return;
    const data = await fetchNotifications(adminToken).catch(() => []);
    setNotes(data);
  }, [adminToken]);

  useEffect(() => {
    loadNotes();
    const id = setInterval(loadNotes, 12000);
    return () => clearInterval(id);
  }, [loadNotes]);

  // Close notification panel when clicking anywhere outside it
  useEffect(() => {
    if (!bellOpen) return;
    function handleOutside(e) {
      if (bellWrapRef.current && !bellWrapRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [bellOpen]);

  async function openBell() {
    setBellOpen(v => !v);
    const unread = notes.filter(n => !n.read);
    if (unread.length) {
      await markNotificationsRead(adminToken).catch(() => {});
      setNotes(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  function handleLogout() {
    setAdminToken(null);
    navigate(adminLoginPath);
  }

  if (!adminToken) return null;

  const unreadCount = notes.filter(n => !n.read).length;
  const TABS = ['المنتجات 🛍', 'الستوريات 📖', 'التعليقات 💬', 'رسائل الستوري 💌', 'المحادثات 💬'];

  // Fetch chats now, find matching ID, then switch tab
  const [pendingChatId, setPendingChatId] = useState(null);

  async function openSenderChat(userName) {
    setTab(4);
    const chats = await fetchAllChats(adminToken).catch(() => []);
    const match = chats.find(c => c.userName === userName);
    if (match) setPendingChatId(match.id);
  }

  return (
    <div className="adash">
      <Toast message={message} type={type} />

      {/* Top bar */}
      <header className="adash__header">
        <button className="adash__logout" onClick={handleLogout}>← خروج</button>

        <div className="adash__brand">
          <img src="/logo.jpg" alt="Glamax" className="adash__logo-img" />
          GLAMAX <span>👑</span>
        </div>

        <div className="adash__header-right">
          {/* Notification bell — click-outside closes panel */}
          <div className="adash__bell-wrap" ref={bellWrapRef}>
            <button className="adash__bell" onClick={openBell} aria-label="Notifications">
              🔔
              {unreadCount > 0 && (
                <span className="adash__bell-badge">{unreadCount}</span>
              )}
            </button>

            {bellOpen && (
              <div className="adash__notif-panel">
                <p className="adash__notif-title">الإشعارات</p>
                {notes.length === 0 && (
                  <p className="adash__notif-empty">لا توجد إشعارات</p>
                )}
                {notes.slice(0, 30).map(n => (
                  <div key={n.id} className={`adash__notif-item ${n.read ? '' : 'adash__notif-item--new'}`}>
                    {/* Thumbnail: product image or story image */}
                    {(n.productImg || n.storyImg)
                      ? <img src={n.productImg || n.storyImg} alt="" className="adash__notif-thumb" />
                      : <span className="adash__notif-thumb adash__notif-thumb--empty">
                          {n.type === 'story_reply' ? '💌' : n.type === 'chat' ? '💬' : '✨'}
                        </span>
                    }
                    <div className="adash__notif-body">
                      {n.type === 'story_reply' ? (
                        <>
                          <p>
                            <strong>{n.senderName}</strong>
                            {' ردّت على "'}
                            <strong>{n.storyTitleAr || n.storyTitleEn}</strong>
                            {'"'}
                          </p>
                          <p className="adash__notif-preview">"{n.messagePreview}"</p>
                        </>
                      ) : n.type === 'chat' ? (
                        <>
                          <p>💬 رسالة من <strong>{n.userName}</strong></p>
                          <p className="adash__notif-preview">"{n.messagePreview}"</p>
                        </>
                      ) : (
                        <p>❤️ إعجاب بـ <strong>{n.productNameAr || n.productNameEn}</strong></p>
                      )}
                      <span className="adash__notif-time">
                        {new Date(n.ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="adash__who">Admin Panel</span>
        </div>
      </header>

      {/* Stats */}
      <StatsRow />

      {/* Tabs */}
      <div className="adash__tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`adash__tab ${tab === i ? 'adash__tab--active' : ''}`}
            onClick={() => setTab(i)}
          >{t}</button>
        ))}
      </div>

      <div className="adash__body">
        {tab === 0 && <ProductsTab    token={adminToken} show={show} />}
        {tab === 1 && <StoriesTab     token={adminToken} show={show} />}
        {tab === 2 && <CommentsTab />}
        {tab === 3 && <StoryRepliesTab token={adminToken} onOpenChat={openSenderChat} />}
        {tab === 4 && <ChatsTab        token={adminToken} pendingChatId={pendingChatId} onPendingCleared={() => setPendingChatId(null)} />}
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsRow() {
  const { products } = useProducts();
  const { stories }  = useStories();
  return (
    <div className="adash__stats">
      {[
        { label: 'التعليقات', value: 0,               icon: '💬' },
        { label: 'الستوريات', value: stories.length,  icon: '📖' },
        { label: 'المنتجات',  value: products.length, icon: '🛍' }
      ].map(s => (
        <div key={s.label} className="adash__stat">
          <span className="adash__stat-icon">{s.icon}</span>
          <span className="adash__stat-num">{s.value}</span>
          <span className="adash__stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Products tab ─────────────────────────────────────────────────────────────
function ProductsTab({ token, show }) {
  const { products, addProduct, removeProduct } = useProducts();
  const EMPTY = { nameAr: '', nameEn: '', price: '', categoryAr: '', categoryEn: '', descAr: '', descEn: '' };
  const [form,    setForm]    = useState(EMPTY);
  const [imgFile, setImgFile] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.nameAr || !form.price || !form.categoryAr) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, k === 'price' ? `${v} ج` : v);
      });
      if (imgFile) fd.append('image', imgFile);
      await addProduct(fd, token);
      setForm(EMPTY);
      setImgFile(null);
      show('تم إضافة المنتج ✓');
    } catch { show('فشلت الإضافة', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('حذف هذا المنتج؟')) return;
    await removeProduct(id, token);
    show('تم الحذف');
  }

  return (
    <div className="ptab">
      <div className="ptab__card">
        <h3 className="ptab__title">+ إضافة منتج جديد</h3>
        <form onSubmit={handleAdd} className="ptab__form">

          {/* Bilingual name */}
          <div className="ptab__bi-row">
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> الاسم بالعربي *</label>
              <input name="nameAr" placeholder="مثال: أحمر شفاه" value={form.nameAr} onChange={ch} className="ptab__input" required />
            </div>
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> Name in English</label>
              <input name="nameEn" placeholder="e.g. Velvet Lipstick" value={form.nameEn} onChange={ch} className="ptab__input" />
            </div>
          </div>

          {/* Price — "ج" is static suffix */}
          <div className="ptab__price-wrap">
            <span className="ptab__price-currency">ج</span>
            <input
              name="price"
              type="number"
              min="0"
              placeholder="199"
              value={form.price}
              onChange={ch}
              className="ptab__input"
              required
            />
          </div>

          {/* Bilingual category */}
          <div className="ptab__bi-row">
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> الفئة بالعربي *</label>
              <input name="categoryAr" placeholder="مثال: شفاه" value={form.categoryAr} onChange={ch} className="ptab__input" required />
            </div>
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> Category in English</label>
              <input name="categoryEn" placeholder="e.g. Lips" value={form.categoryEn} onChange={ch} className="ptab__input" />
            </div>
          </div>

          {/* Bilingual description */}
          <div className="ptab__bi-row">
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> الوصف بالعربي</label>
              <textarea name="descAr" placeholder="وصف المنتج…" value={form.descAr} onChange={ch} className="ptab__input ptab__textarea" />
            </div>
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> Description in English</label>
              <textarea name="descEn" placeholder="Product description…" value={form.descEn} onChange={ch} className="ptab__input ptab__textarea" />
            </div>
          </div>

          <p className="ptab__label">صورة المنتج</p>
          <UploadZone onFile={setImgFile} />

          <button type="submit" className="ptab__add-btn" disabled={saving}>
            {saving ? '…' : '+ إضافة المنتج'}
          </button>
        </form>
      </div>

      <div className="ptab__grid">
        {products.map(p => (
          <div key={p.id} className="ptab__product">
            {p.img
              ? <img src={p.img} alt={p.nameAr || p.name} className="ptab__product-img" />
              : <div className="ptab__product-img ptab__product-img--empty">✨</div>
            }
            <span className="ptab__cat">{p.categoryAr || p.category}</span>
            <h4 className="ptab__product-name">{p.nameAr || p.name}</h4>
            {p.nameEn && p.nameEn !== (p.nameAr || p.name) && (
              <p className="ptab__product-name-en">{p.nameEn}</p>
            )}
            <p className="ptab__product-desc">{p.descAr || p.desc}</p>
            <p className="ptab__product-price">{p.price}</p>
            <button className="ptab__del-btn" onClick={() => handleDelete(p.id)}>🗑 حذف</button>
            <div className="ptab__product-meta">
              <span>♥ {p.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stories tab ──────────────────────────────────────────────────────────────
function StoriesTab({ token, show }) {
  const { stories, addStory, removeStory } = useStories();
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [saving,  setSaving]  = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!titleAr) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titleAr', titleAr);
      fd.append('titleEn', titleEn || titleAr);
      if (imgFile) fd.append('image', imgFile);
      await addStory(fd, token);
      setTitleAr(''); setTitleEn(''); setImgFile(null);
      show('تم إضافة الستوري ✓');
    } catch { show('فشلت الإضافة', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('حذف هذا الستوري؟')) return;
    await removeStory(id, token);
    show('تم الحذف');
  }

  return (
    <div className="stab">
      <div className="stab__card">
        <h3 className="stab__title">+ إضافة ستوري جديد</h3>
        <form onSubmit={handleAdd} className="stab__form">
          <div className="ptab__bi-row">
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> العنوان بالعربي *</label>
              <input className="stab__input" placeholder="مثال: عروض الأسبوع ✨" value={titleAr} onChange={e => setTitleAr(e.target.value)} required />
            </div>
            <div className="ptab__bi-group">
              <label className="ptab__bi-label"> Title in English</label>
              <input className="stab__input" placeholder="e.g. Weekly Offers ✨" value={titleEn} onChange={e => setTitleEn(e.target.value)} />
            </div>
          </div>
          <p className="stab__label">صورة الستوري</p>
          <UploadZone onFile={setImgFile} />
          <button type="submit" className="stab__add-btn" disabled={saving}>
            {saving ? '…' : '+ إضافة الستوري'}
          </button>
        </form>
      </div>

      <div className="stab__grid">
        {stories.map(s => (
          <div key={s.id} className="stab__story">
            {s.img
              ? <img src={s.img} alt={s.titleAr || s.title} className="stab__story-img" />
              : <div className="stab__story-img stab__story-img--empty">✨</div>
            }
            <p className="stab__story-title">{s.titleAr || s.title}</p>
            {/* Stats row */}
            <div className="stab__story-stats">
              <span title="المشاهدات">👁 {s.views || 0}</span>
              <span title="الإعجابات">❤️ {s.likes || 0}</span>
              {(s.likedBy || []).length > 0 && (
                <span className="stab__liked-by" title={(s.likedBy || []).join('، ')}>
                  {(s.likedBy || []).slice(0, 2).join('، ')}
                  {(s.likedBy || []).length > 2 ? ` +${(s.likedBy || []).length - 2}` : ''}
                </span>
              )}
            </div>
            {s.titleEn && s.titleEn !== (s.titleAr || s.title) && (
              <p className="stab__story-title stab__story-title--en">{s.titleEn}</p>
            )}
            <div className="stab__story-actions">
              <button className="stab__del-btn" onClick={() => handleDelete(s.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Story Replies tab ────────────────────────────────────────────────────────
function StoryRepliesTab({ token, onOpenChat }) {
  const [replies,  setReplies]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetchStoryReplies(token)
      .then(setReplies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="pg-state">جاري التحميل…</p>;
  if (!replies.length) return <p className="pg-state">لا توجد رسائل بعد ✨</p>;

  return (
    <div className="sreplies">
      {replies.map(r => (
        <button
          key={r.id}
          className={`sreplies__item sreplies__item--btn ${r.read ? '' : 'sreplies__item--new'}`}
          onClick={() => onOpenChat?.(r.senderName)}
          title="فتح المحادثة"
        >
          {/* Story thumbnail */}
          <div className="sreplies__story">
            {r.storyImg
              ? <img src={r.storyImg} alt="" className="sreplies__thumb" />
              : <div className="sreplies__thumb sreplies__thumb--empty">✨</div>
            }
            <span className="sreplies__story-name">{r.storyTitleAr || r.storyTitleEn}</span>
          </div>

          {/* Message */}
          <div className="sreplies__msg-wrap">
            <div className="sreplies__sender">
              <span className="sreplies__dot" />
              <strong>{r.senderName}</strong>
              <span className="sreplies__time">
                {new Date(r.ts).toLocaleString('ar-EG', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <p className="sreplies__message">"{r.message}"</p>
          </div>

          {/* Arrow hint */}
          <span className="sreplies__open-hint">←</span>
        </button>
      ))}
    </div>
  );
}

// ─── Comments tab ─────────────────────────────────────────────────────────────
function CommentsTab() {
  const { products } = useProducts();
  const [open, setOpen] = useState({});

  return (
    <div className="ctab">
      {products.map(p => (
        <div key={p.id} className="ctab__product">
          <button className="ctab__product-header" onClick={() => setOpen(o => ({ ...o, [p.id]: !o[p.id] }))}>
            <span>{open[p.id] ? '▲' : '▼'}</span>
            <div className="ctab__product-info">
              <span className="ctab__product-name">{p.nameAr || p.name}</span>
              <span className="ctab__product-cat">{p.categoryAr || p.category}</span>
            </div>
            {p.img
              ? <img src={p.img} alt="" className="ctab__product-thumb" />
              : <div className="ctab__product-thumb ctab__product-thumb--empty">✨</div>
            }
          </button>
          {open[p.id] && (
            <div className="ctab__comments">
              <CommentSection productId={p.id} isAdmin />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Chats tab ────────────────────────────────────────────────────────────────
function ChatsTab({ token, pendingChatId, onPendingCleared }) {
  const [chats,    setChats]    = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread,   setThread]   = useState([]);
  const [reply,    setReply]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const pollRef                 = useRef(null);
  const bottomRef               = useRef(null);

  const loadChats = useCallback(async () => {
    const data = await fetchAllChats(token).catch(() => []);
    setChats(data);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadChats(); const id = setInterval(loadChats, 8000); return () => clearInterval(id); }, [loadChats]);

  // Auto-open chat when pendingChatId is set (from story reply click)
  useEffect(() => {
    if (!pendingChatId) return;
    openChat(pendingChatId);
    onPendingCleared?.();
  }, [pendingChatId]);

  // Poll thread messages every 4s
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeId) return;
    const load = async () => {
      const msgs = await fetchMessages(activeId).catch(() => null);
      if (msgs) setThread(msgs);
    };
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [activeId]);

  // Auto-scroll to bottom whenever thread updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  async function openChat(id) {
    setActiveId(id);
    await markChatRead(id, token).catch(() => {});
    setChats(prev => prev.map(c => c.id === id ? { ...c, unreadByAdmin: 0 } : c));
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim() || !activeId) return;
    const msg = await sendMessage(activeId, { text: reply.trim(), from: 'admin' });
    setThread(prev => [...prev, msg]);
    setReply('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  const activeChat = chats.find(c => c.id === activeId);

  if (loading) return <p className="pg-state">جاري التحميل…</p>;

  return (
    <div className="chat-admin">
      {/* Sidebar */}
      <div className="chat-admin__list">
        <p className="chat-admin__list-title">المحادثات</p>
        {chats.length === 0 && <p className="chat-admin__empty">لا توجد محادثات بعد ✨</p>}
        {chats.map(c => (
          <button key={c.id} className={`chat-admin__item ${activeId === c.id ? 'chat-admin__item--active' : ''}`} onClick={() => openChat(c.id)}>
            <div className="chat-admin__avatar">{(c.userName || '?')[0].toUpperCase()}</div>
            <div className="chat-admin__item-info">
              <span className="chat-admin__item-name">{c.userName}</span>
              <span className="chat-admin__item-preview">{c.messages?.[c.messages.length - 1]?.text?.slice(0, 30) || '—'}</span>
            </div>
            {c.unreadByAdmin > 0 && <span className="chat-admin__unread">{c.unreadByAdmin}</span>}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className="chat-admin__thread">
        {!activeChat ? (
          <div className="chat-admin__empty-thread"><span>💬</span><p>اختر محادثة</p></div>
        ) : (
          <>
            <div className="chat-admin__thread-header"><strong>{activeChat.userName}</strong></div>
            <div className="chat-admin__messages">
              {thread.map(msg => (
                <div key={msg.id} className={`chat-msg chat-msg--${msg.from === 'admin' ? 'admin' : 'user'}`}>
                  {/* Story reply card */}
                  {msg.replyTo?.type === 'story' && (
                    <div className="chat-reply-card">
                      {msg.replyTo.img
                        ? <img src={msg.replyTo.img} alt="" className="chat-reply-card__img" />
                        : <div className="chat-reply-card__empty">✨</div>
                      }
                      <div className="chat-reply-card__footer">
                        <span className="chat-reply-card__label">↩ ردّ على الستوري</span>
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
                        <span className="chat-reply-card__label">🛍 استفسار عن منتج</span>
                        <span className="chat-reply-card__title">{msg.replyTo.name}</span>
                        <span className="chat-reply-card__sub">{msg.replyTo.price}</span>
                      </div>
                    </div>
                  )}
                  <div className="chat-msg__bubble">{msg.text}</div>
                  <span className="chat-msg__time">{new Date(msg.ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-admin__reply" onSubmit={handleReply}>
              <input className="chat-admin__reply-input" placeholder="اكتب ردًّا كـ Glamax CRS…" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleReply(e); }} />
              <button type="submit" className="chat-admin__reply-btn" disabled={!reply.trim()}>↵</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
