/**
 * useProducts.js — Custom hook for fetching and mutating products.
 * Components never call fetch/axios directly — they use this hook.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, createProduct, deleteProduct } from '../api/client';

/**
 * Provides product list plus add/remove helpers.
 * @returns {{ products, loading, error, addProduct, removeProduct, reload }}
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addProduct = useCallback(async (formData, token) => {
    const product = await createProduct(formData, token);
    setProducts(prev => [product, ...prev]);
    return product;
  }, []);

  const removeProduct = useCallback(async (id, token) => {
    setProducts(prev => prev.filter(p => p.id !== id)); // optimistic
    try {
      await deleteProduct(id, token);
    } catch {
      load(); // restore on failure
      throw new Error('delete failed');
    }
  }, [load]);

  return { products, loading, error, addProduct, removeProduct, reload: load };
}
