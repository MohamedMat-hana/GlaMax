/**
 * ProductCard.jsx — Product card with persistent like toggle,
 * real comment count, and comment/order modals.
 */

import { useState, useEffect } from 'react';
import { useLang }             from '../../context/LangContext';
import { likeProduct, fetchComments } from '../../api/client';
import { getImageUrl }         from '../../utils/getImageUrl';
import CommentModal  from '../modals/CommentModal';
import OrderModal    from '../modals/OrderModal';
import './ProductCard.css';

const LIKED_KEY = 'glamax_liked_products';

/** Read liked map from localStorage: { [productId]: true } */
function readLiked() {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '{}'); }
  catch { return {}; }
}

/** Write liked map back to localStorage */
function writeLiked(map) {
  try { localStorage.setItem(LIKED_KEY, JSON.stringify(map)); } catch {}
}

function pick(product, field, lang) {
  const ar = product[`${field}Ar`] || product[field] || '';
  const en = product[`${field}En`] || ar;
  return lang === 'en' ? en : ar;
}

export default function ProductCard({ product, style }) {
  const { lang, t } = useLang();

  // Initialise from localStorage — no hook dependency on product.id so it doesn't reset
  const [liked,        setLiked]        = useState(() => Boolean(readLiked()[product.id]));
  const [likeCount,    setLikeCount]    = useState(product.likes || 0);
  const [commentOpen,  setCommentOpen]  = useState(false);
  const [orderOpen,    setOrderOpen]    = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const name     = pick(product, 'name',     lang);
  const desc     = pick(product, 'desc',     lang);
  const category = pick(product, 'category', lang);

  // Fetch real comment count on mount
  useEffect(() => {
    fetchComments(product.id)
      .then(list => setCommentCount(list.length))
      .catch(() => {});
  }, [product.id]);

  function handleLike() {
    const map = readLiked();
    if (liked) {
      // Unlike: remove from map, decrement display count
      delete map[product.id];
      writeLiked(map);
      setLiked(false);
      setLikeCount(n => Math.max(0, n - 1));
    } else {
      // Like: save to map, increment display count, inform server
      map[product.id] = true;
      writeLiked(map);
      setLiked(true);
      setLikeCount(n => n + 1);
      likeProduct(product.id).catch(() => {});
    }
  }

  return (
    <>
      <article className="product-card fade-up" style={style}>
        <div className="product-card__img-wrap">
          {product.img
            ? <img src={getImageUrl(product.img)} alt={name} className="product-card__img" />
            : <div className="product-card__img-placeholder">✨</div>
          }
          <div className="product-card__overlay" />
          {category && <span className="product-card__badge">{category}</span>}
          <h2 className="product-card__name">{name}</h2>
        </div>

        <div className="product-card__body">
          {desc && <p className="product-card__desc">{desc}</p>}

          <div className="product-card__meta">
            <div className="product-card__actions">
              <button className="product-card__icon-btn" onClick={() => setCommentOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{commentCount}</span>
              </button>

              <button
                className={`product-card__icon-btn product-card__like ${liked ? 'product-card__like--active' : ''}`}
                onClick={handleLike}
                aria-pressed={liked}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill={liked ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{likeCount}</span>
              </button>
            </div>

            <span className="product-card__price">{product.price}</span>
          </div>

          {/* Two inquiry options */}
          <div className="product-card__inquire-row">
            {/* Chat on site — stores product context in localStorage before opening */}
            <button
              className="product-card__inquire-btn product-card__inquire-btn--chat"
              onClick={() => {
                const msg = lang === 'ar'
                  ? `أنا مهتمة بـ "${name}" بسعر ${product.price} 😍`
                  : `I'm interested in "${name}" for ${product.price} 😍`;
                // Store prefill BEFORE opening so ChatPanel reads it on mount
                localStorage.setItem('glamax_chat_prefill', JSON.stringify({
                  text:    msg,
                  product: { name, price: product.price, img: product.img || '' }
                }));
                window.dispatchEvent(new CustomEvent('glamax:open-chat'));
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {lang === 'ar' ? 'شات' : 'Chat'}
            </button>

            {/* Instagram DM */}
            <button
              className="product-card__inquire-btn product-card__inquire-btn--ig"
              onClick={() => setOrderOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              {lang === 'ar' ? 'إنستا' : 'Instagram'}
            </button>
          </div>
        </div>
      </article>

      {commentOpen && (
        <CommentModal product={product} onClose={() => setCommentOpen(false)} onCountChange={setCommentCount} />
      )}
      {orderOpen && (
        <OrderModal product={product} onClose={() => setOrderOpen(false)} />
      )}
    </>
  );
}
