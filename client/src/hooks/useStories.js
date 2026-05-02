/**
 * useStories.js — Custom hook for fetching and mutating stories.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchStories, createStory, deleteStory } from '../api/client';

/**
 * Provides story list plus add/remove helpers.
 * @returns {{ stories, loading, error, addStory, removeStory, reload }}
 */
export function useStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStories();
      setStories(data);
    } catch {
      setError('فشل تحميل الستوريات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addStory = useCallback(async (formData, token) => {
    const story = await createStory(formData, token);
    setStories(prev => [story, ...prev]);
    return story;
  }, []);

  const removeStory = useCallback(async (id, token) => {
    await deleteStory(id, token);
    setStories(prev => prev.filter(s => s.id !== id));
  }, []);

  return { stories, loading, error, addStory, removeStory, reload: load };
}
