/**
 * OrderModal.jsx — Instagram product inquiry modal. Fully bilingual via useLang().
 */

import { useRef }        from 'react';
import { useLang }       from '../../context/LangContext';
import { getImageUrl }   from '../../utils/getImageUrl';
import './OrderModal.css';

const IG_USER = import.meta.env.VITE_IG_USER || 'glamaxcrs';

/**
 * @param {{ product: object, onClose: () => void }} props
 */
export default function OrderModal({ product, onClose }) {
  const { lang, t } = useLang();
  const btnRef      = useRef(null);

  const message = lang === 'ar'
    ? `مرحباً! أنا مهتمة بـ "${product.name}" بسعر ${product.price} 😍\nممكن تفيديني بالتفاصيل والتوصيل؟ 💕`
    : `Hi! I'm interested in "${product.name}" for ${product.price} 😍\nCould you give me details and delivery info? 💕`;

  async function handleCopy() {
    await navigator.clipboard.writeText(message).catch(() => {});
    if (btnRef.current) {
      btnRef.current.textContent = t('copied');
      setTimeout(() => { if (btnRef.current) btnRef.current.textContent = t('copyMsg'); }, 1500);
    }
  }

  function handleIG() {
    window.open(`https://ig.me/m/${IG_USER}`, '_blank', 'noopener');
  }

  return (
    <div className="om-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="om-card" onClick={e => e.stopPropagation()}>
        <button className="om-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="om-product">
          {product.img && (
            <img src={getImageUrl(product.img)} alt={product.name} className="om-product__img" />
          )}
          <div className="om-product__info">
            <h3 className="om-product__name">{product.name}</h3>
            <span className="om-product__price">{product.price}</span>
          </div>
        </div>

        <p className="om-label">{t('readyMsg')}</p>
        <div className="om-message">{message}</div>

        <div className="om-actions">
          <button ref={btnRef} className="om-btn om-btn--copy" onClick={handleCopy}>
            {t('copyMsg')}
          </button>
          <button className="om-btn om-btn--ig" onClick={handleIG}>
            {t('openIG')}
          </button>
        </div>
      </div>
    </div>
  );
}
