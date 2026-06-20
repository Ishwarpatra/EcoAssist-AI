import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export function useApi() {
  const fetchWithAuth = async (url: string, token: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401 || res.status === 403) {
      await signOut(auth);
      window.location.href = '/login';
    }

    return res;
  };
  return { fetchWithAuth };
}
