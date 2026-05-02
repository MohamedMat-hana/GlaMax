/**
 * client.js — Axios instance and all API call functions for Glamax CRS.
 * Components never call axios directly — they use these functions.
 * All admin-protected calls require passing the admin token.
 */

import axios from 'axios';

/** In dev: proxy through Vite (localhost:4000). In production: VITE_API_URL */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/'
});

// ─── Helper ───────────────────────────────────────────────────────────────────
/** Builds the Authorization header object for admin requests */
const authHeader = token => ({ Authorization: `Bearer ${token}` });

// ─── Products ─────────────────────────────────────────────────────────────────
export const fetchProducts = () =>
  api.get('/api/products').then(r => r.data);

export const createProduct = (formData, token) =>
  api.post('/api/products', formData, { headers: authHeader(token) }).then(r => r.data);

export const deleteProduct = (id, token) =>
  api.delete(`/api/products/${id}`, { headers: authHeader(token) }).then(r => r.data);

// ─── Stories ──────────────────────────────────────────────────────────────────
export const fetchStories = () =>
  api.get('/api/stories').then(r => r.data);

export const createStory = (formData, token) =>
  api.post('/api/stories', formData, { headers: authHeader(token) }).then(r => r.data);

export const deleteStory = (id, token) =>
  api.delete(`/api/stories/${id}`, { headers: authHeader(token) }).then(r => r.data);

// ─── Comments ─────────────────────────────────────────────────────────────────
export const fetchComments = productId =>
  api.get(`/api/comments/${productId}`).then(r => r.data);

export const postComment = (productId, body) =>
  api.post(`/api/comments/${productId}`, body).then(r => r.data);

export const deleteComment = (productId, commentId, token) =>
  api.delete(`/api/comments/${productId}/${commentId}`, { headers: authHeader(token) }).then(r => r.data);

export const likeComment = (productId, commentId) =>
  api.patch(`/api/comments/${productId}/${commentId}/like`).then(r => r.data);

// ─── Replies ──────────────────────────────────────────────────────────────────
export const postReply = (productId, commentId, body) =>
  api.post(`/api/comments/${productId}/${commentId}/replies`, body).then(r => r.data);

export const deleteReply = (productId, commentId, replyId, token) =>
  api.delete(`/api/comments/${productId}/${commentId}/replies/${replyId}`, {
    headers: authHeader(token)
  }).then(r => r.data);

export const likeReply = (productId, commentId, replyId) =>
  api.patch(`/api/comments/${productId}/${commentId}/replies/${replyId}/like`).then(r => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────
export const fetchUser = email =>
  api.get(`/api/users/${encodeURIComponent(email)}`).then(r => r.data);

export const saveUser = body =>
  api.post('/api/users', body).then(r => r.data);

// ─── Admin auth ───────────────────────────────────────────────────────────────
export const adminLogin = password =>
  api.post('/api/admin/login', { password }).then(r => r.data);

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadImage = (formData, token) =>
  api.post('/api/upload', formData, { headers: authHeader(token) }).then(r => r.data);

// ─── Like a product (persisted) ───────────────────────────────────────────────
export const likeProduct = id =>
  api.patch(`/api/products/${id}/like`).then(r => r.data);


// ─── Notifications ────────────────────────────────────────────────────────────
export const fetchNotifications = token =>
  api.get('/api/notifications', { headers: authHeader(token) }).then(r => r.data);

export const markNotificationsRead = token =>
  api.patch('/api/notifications/read', {}, { headers: authHeader(token) }).then(r => r.data);

// ─── Story replies ─────────────────────────────────────────────────────────────
export const sendStoryReply    = body   => api.post('/api/story-replies', body).then(r => r.data);
export const fetchStoryReplies = token  => api.get('/api/story-replies', { headers: authHeader(token) }).then(r => r.data);

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const startChat       = body         => api.post('/api/chats', body).then(r => r.data);
export const fetchMessages   = chatId       => api.get(`/api/chats/${chatId}/messages`).then(r => r.data);
export const sendMessage     = (chatId, body) => api.post(`/api/chats/${chatId}/messages`, body).then(r => r.data);
export const fetchAllChats   = token        => api.get('/api/chats', { headers: authHeader(token) }).then(r => r.data);
export const markChatRead    = (chatId, token) => api.patch(`/api/chats/${chatId}/read`, {}, { headers: authHeader(token) }).then(r => r.data);
