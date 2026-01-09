import { useEffect, useState } from 'react';
import { AUTH_SESSION_EVENT, getAuthToken, getAuthUser } from '@/lib/auth';

const useAuthSession = () => {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(getAuthUser());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleChange = () => {
      setToken(getAuthToken());
      setUser(getAuthUser());
    };

    window.addEventListener(AUTH_SESSION_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
  };
};

export default useAuthSession;
