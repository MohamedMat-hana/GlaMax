/**
 * ProductGrid.jsx — Category filter pills and responsive product card grid.
 */

import { useState, useMemo } from 'react';
import { useLang }  from '../../context/LangContext';
import ProductCard  from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products = [], loading, error }) {
  const { t, lang }   = useLang();
  const ALL           = t('all');
  const [active, setActive] = useState('الكل');

  // Build unique category list — prefer bilingual categoryAr/categoryEn
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => {
      const ar = p.categoryAr || p.category || '';
      const en = p.categoryEn || ar;
      return lang === 'en' ? en : ar;
    }).filter(Boolean))];
    return [ALL, ...cats];
  }, [products, ALL, lang]);

  // Filter by raw category fields (support both old and new)
  const isAll = active === ALL || !products.some(p => {
    const label = lang === 'en' ? (p.categoryEn || p.categoryAr || p.category || '') : (p.categoryAr || p.category || '');
    return label === active;
  });

  const visible = isAll ? products : products.filter(p => {
    const label = lang === 'en' ? (p.categoryEn || p.categoryAr || p.category || '') : (p.categoryAr || p.category || '');
    return label === active;
  });

  return (
    <section className="product-grid-section">
      <div className="product-filters" role="tablist">
        {categories.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat || (cat === ALL && isAll)}
            className={`filter-pill ${active === cat || (cat === ALL && isAll) ? 'filter-pill--active' : ''}`}
            onClick={() => setActive(cat)}
          >{cat}</button>
        ))}
      </div>

      {loading && <div className="pg-state">{t('loading')}</div>}
      {error   && <div className="pg-state pg-state--error">{error}</div>}
      {!loading && !error && visible.length === 0 && (
        <div className="pg-state">{t('noProducts')}</div>
      )}

      {!loading && !error && (
        <div className="product-grid">
          {visible.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ animationDelay: `${idx * 0.07}s` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
