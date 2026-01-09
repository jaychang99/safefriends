export interface AuthUser {
  username: string;
  nickname: string;
  memberId?: number;
}

const TOKEN_KEY = 'safelens_token';
const USER_KEY = 'safelens_user';

export const AUTH_SESSION_EVENT = 'auth:changed';
export const AUTH_EXPIRED_EVENT = 'auth:expired';
export const AUTH_FORBIDDEN_EVENT = 'auth:forbidden';

const isBrowser = () => typeof window !== 'undefined';

export const getAuthToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const getAuthUser = () => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const notifyAuthChanged = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT));
};

export const setAuthSession = (token: string, user: AuthUser) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthChanged();
};
