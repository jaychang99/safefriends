export interface AuthUser {
  username?: string;
  nickname?: string;
  memberId?: number;
}

const TOKEN_KEY = 'safelens_token';

export const AUTH_SESSION_EVENT = 'auth:changed';
export const AUTH_EXPIRED_EVENT = 'auth:expired';
export const AUTH_FORBIDDEN_EVENT = 'auth:forbidden';

const isBrowser = () => typeof window !== 'undefined';

export const getAuthToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

const notifyAuthChanged = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT));
};

export const setAuthSession = (token: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  notifyAuthChanged();
};
