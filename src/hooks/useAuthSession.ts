import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AUTH_SESSION_EVENT, getAuthToken } from '@/lib/auth';
import { getMe } from '@/lib/api';

const useAuthSession = () => {
  const [token, setToken] = useState(getAuthToken());

  const meQuery = useQuery({
    queryKey: ['me', token],
    queryFn: getMe,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleChange = () => {
      setToken(getAuthToken());
    };

    window.addEventListener(AUTH_SESSION_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const user = meQuery.data
    ? {
        memberId: meQuery.data.id,
        nickname: meQuery.data.nickname,
        username: meQuery.data.username,
      }
    : null;

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoadingUser: Boolean(token) && meQuery.isLoading,
  };
};

export default useAuthSession;
