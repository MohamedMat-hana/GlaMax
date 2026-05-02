/**
 * useComments.js — Custom hook for fetching and mutating comments for one product.
 * @param {string} productId - The product whose comments to manage
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchComments, postComment, deleteComment, likeComment,
  postReply,     deleteReply,  likeReply
} from '../api/client';

/**
 * Provides comment list and all mutation helpers.
 * @param {string} productId
 */
export function useComments(productId) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await fetchComments(productId);
      setComments(data);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback(async body => {
    const comment = await postComment(productId, body);
    setComments(prev => [...prev, comment]);
    return comment;
  }, [productId]);

  const removeComment = useCallback(async (commentId, token) => {
    await deleteComment(productId, commentId, token);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, [productId]);

  const toggleLikeComment = useCallback(async commentId => {
    const { likes } = await likeComment(productId, commentId);
    setComments(prev =>
      prev.map(c => c.id === commentId ? { ...c, likes } : c)
    );
  }, [productId]);

  const addReply = useCallback(async (commentId, body) => {
    const reply = await postReply(productId, commentId, body);
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
    return reply;
  }, [productId]);

  const removeReply = useCallback(async (commentId, replyId, token) => {
    await deleteReply(productId, commentId, replyId, token);
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, replies: (c.replies || []).filter(r => r.id !== replyId) }
          : c
      )
    );
  }, [productId]);

  const toggleLikeReply = useCallback(async (commentId, replyId) => {
    const { likes } = await likeReply(productId, commentId, replyId);
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: (c.replies || []).map(r =>
                r.id === replyId ? { ...r, likes } : r
              )
            }
          : c
      )
    );
  }, [productId]);

  return {
    comments, loading,
    addComment, removeComment, toggleLikeComment,
    addReply,   removeReply,   toggleLikeReply,
    reload: load
  };
}
