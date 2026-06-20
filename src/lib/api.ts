export function useApi() {
  const fetchWithAuth = async (url: string, token: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };
  return { fetchWithAuth };
}
