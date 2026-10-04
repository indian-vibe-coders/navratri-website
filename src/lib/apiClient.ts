import type { Garba, GarbaSummary, LibrarySection } from '../types';

// Same-origin API on MilesWeb (Vite proxies /api to the local server in dev)
const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

const TOKENS_KEY = 'navswar_comment_tokens_v1';
const LIKED_KEY = 'navswar_liked_comments_v1';

export interface AudioComment {
  id: string;
  garbaId: string;
  userName: string;
  commentText: string;
  audioUrl?: string;
  audioName?: string;
  audioDuration?: number;
  likes: number;
  timestamp: number;
  userLiked: boolean;
  isCurrentUser: boolean; // this browser holds the delete token
}

interface ApiComment extends Omit<AudioComment, 'audioUrl' | 'userLiked' | 'isCurrentUser'> {
  audioFile?: string;
  deleteToken?: string;
}

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error || `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

function toAudioComment(c: ApiComment): AudioComment {
  const tokens = readStore<Record<string, string>>(TOKENS_KEY, {});
  const liked = readStore<string[]>(LIKED_KEY, []);
  return {
    id: c.id,
    garbaId: c.garbaId,
    userName: c.userName,
    commentText: c.commentText,
    audioUrl: c.audioFile ? `${API_BASE}/uploads/${encodeURIComponent(c.audioFile)}` : undefined,
    audioName: c.audioName,
    audioDuration: c.audioDuration,
    likes: c.likes,
    timestamp: c.timestamp,
    userLiked: liked.includes(c.id),
    isCurrentUser: !!tokens[c.id],
  };
}

export interface SongPage {
  items: GarbaSummary[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchLibrary(): Promise<LibrarySection[]> {
  return request<LibrarySection[]>('/library');
}

export async function fetchSongs(
  params: { collection?: string; sub?: string; q?: string; ids?: string[]; page?: number; limit?: number },
  signal?: AbortSignal,
): Promise<SongPage> {
  const qs = new URLSearchParams();
  if (params.collection) qs.set('collection', params.collection);
  if (params.sub) qs.set('sub', params.sub);
  if (params.q) qs.set('q', params.q);
  if (params.ids?.length) qs.set('ids', params.ids.join(','));
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return request<SongPage>(`/songs?${qs}`, { signal });
}

export async function fetchSong(id: string): Promise<Garba> {
  return request<Garba>(`/songs/${encodeURIComponent(id)}`);
}

export async function postGarba(garba: Garba, userEmail?: string): Promise<Garba> {
  return request<Garba>('/garbas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...garba, userEmail }),
  });
}

export async function syncUser(user: { email: string; name: string; avatarUrl?: string; googleId?: string }): Promise<{
  user: { email: string; name: string; avatarUrl?: string };
  favorites: string[];
}> {
  return request('/users/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
}

export async function getUserFavorites(email: string): Promise<string[]> {
  const res = await request<{ favorites: string[] }>(`/users/favorites?email=${encodeURIComponent(email)}`);
  return res.favorites || [];
}

export async function saveUserFavorite(email: string, garbaId: string): Promise<void> {
  await request('/users/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, garbaId }),
  });
}

export async function removeUserFavorite(email: string, garbaId: string): Promise<void> {
  await request('/users/favorites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, garbaId }),
  });
}


export async function fetchComments(garbaId: string): Promise<AudioComment[]> {
  const list = await request<ApiComment[]>(`/garbas/${encodeURIComponent(garbaId)}/comments`);
  return list.map(toAudioComment);
}

export async function postComment(
  garbaId: string,
  input: { authorName: string; commentText: string; audio?: Blob; audioName?: string; audioDuration?: number },
): Promise<AudioComment> {
  const form = new FormData();
  form.append('authorName', input.authorName);
  form.append('commentText', input.commentText);
  if (input.audio) {
    form.append('audio', input.audio, input.audioName || 'voice-reference.webm');
    if (input.audioDuration) form.append('audioDuration', String(input.audioDuration));
  }

  const created = await request<ApiComment>(`/garbas/${encodeURIComponent(garbaId)}/comments`, {
    method: 'POST',
    body: form,
  });

  if (created.deleteToken) {
    writeStore(TOKENS_KEY, { ...readStore(TOKENS_KEY, {}), [created.id]: created.deleteToken });
  }
  // The author's own like is counted server-side
  writeStore(LIKED_KEY, [...readStore<string[]>(LIKED_KEY, []), created.id]);
  return toAudioComment(created);
}

export async function setCommentLiked(commentId: string, liked: boolean): Promise<number> {
  const { likes } = await request<{ likes: number }>(`/comments/${encodeURIComponent(commentId)}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked }),
  });
  const current = readStore<string[]>(LIKED_KEY, []).filter((id) => id !== commentId);
  writeStore(LIKED_KEY, liked ? [...current, commentId] : current);
  return likes;
}

export async function deleteComment(commentId: string): Promise<void> {
  const tokens = readStore<Record<string, string>>(TOKENS_KEY, {});
  // POST, not DELETE: the MilesWeb web server blocks the DELETE method
  await request<void>(`/comments/${encodeURIComponent(commentId)}/delete`, {
    method: 'POST',
    headers: { 'X-Delete-Token': tokens[commentId] ?? '' },
  });
  delete tokens[commentId];
  writeStore(TOKENS_KEY, tokens);
}
