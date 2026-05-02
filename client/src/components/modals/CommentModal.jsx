/**
 * CommentModal.jsx — Full-screen overlay showing a product's comment section.
 * Replaces the old inline comment expansion on the product card.
 */

import { useEffect }   from 'react';
import { useLang }     from '../../context/LangContext';
import { getImageUrl } from '../../utils/getImageUrl';
import CommentSection  from '../comments/CommentSection';
import './CommentModal.css';

/**
 * @param {{ product: object, onClose: () => void, onCountChange?: (n:number) => void }} props
 */
export default function CommentModal({ product, onClose, onCountChange }) {
  const { lang } = useLang();

  const name = lang === 'en'
    ? (product.nameEn || product.nameAr || product.name || '')
    : (product.nameAr || product.name || '');

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="cm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cm-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cm-header">
          {product.img && (
            <img src={getImageUrl(product.img)} alt={name} className="cm-header__img" />
          )}
          <div className="cm-header__info">
            <h3 className="cm-header__name">{name}</h3>
            <span className="cm-header__price">{product.price}</span>
          </div>
          <button className="cm-header__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Comment section — reports count back to card */}
        <div className="cm-body">
          <CommentSection productId={product.id} onCountChange={onCountChange} />
        </div>
      </div>
    </div>
  );
}
