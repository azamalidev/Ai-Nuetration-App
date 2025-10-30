import { useState, useEffect } from 'react';
import { apiService, LoginData, UserProfile } from '../api/api';

interface AuthState {
  user: UserProfile | null;
  token: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: '',
    isLoading: true, // ✅ Start as true
    isAuthenticated: false,
  });

  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('authToken');

  let parsedUser: UserProfile | null = null;

  // ✅ Safe parsing
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Failed to parse stored user:', e);
    localStorage.removeItem('user'); // optional: clean up corrupted data
  }

  if (parsedUser && storedToken) {
    setAuthState({
      user: parsedUser,
      token: storedToken,
      isLoading: false,
      isAuthenticated: true,
    });
  } else {
    setAuthState((prev) => ({ ...prev, isLoading: false }));
  }
}, []);


  const login = async (credentials: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiService.login(credentials);

      if (response && response.data?.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('authToken', response.data.token);

        setAuthState({
          user: response.data.data,
          token: response.data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        const errorMessage = response?.meta?.message || 'Unexpected login response';
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login error';
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // ✅ fixed key
    setAuthState({
      user: null,
      token: '',
      isLoading: false,
      isAuthenticated: false,
    });
    setError(null);
  };

  return {
    ...authState,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };
};
