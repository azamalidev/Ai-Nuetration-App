import { useState, useEffect, useCallback } from 'react';
import {
  apiService,
  LoginData,
  UserProfile,
} from '../api/api';

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
    isLoading: false,
    isAuthenticated: false,
  });
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      setAuthState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);


  // Login function - FIXED
  const login = async (credentials: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await apiService.login(credentials);

      if (response) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('authToken', response.data.token);
        setAuthState({
          user: response.data.data,
          token: response.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log("User ID (immediate):", authState); // ✅ This always works

        return { success: true };
      } else {
        const errorMessage = response?.meta?.message || 'Unexpected login response';
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login error';
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };



  // Logout function
  const logout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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

    // checkAuthState,
    clearError: () => setError(null),
  };
};