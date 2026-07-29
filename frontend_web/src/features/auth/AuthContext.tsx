import { createContext, useContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout, type LoginRequest, type RegisterRequest, type UserSummary } from './authApi';

type AuthState = {
  user: UserSummary | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (data: LoginRequest) => Promise<UserSummary>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const TOKEN_KEY = 'freshmarket:token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    getCurrentUser(savedToken)
      .then((user) => setState({ user, token: savedToken, loading: false }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    setState({ user: response.user, token: response.accessToken, loading: false });
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await apiRegister(data);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    setState({ user: response.user, token: response.accessToken, loading: false });
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    isAuthenticated: state.user !== null,
    isAdmin: state.user?.roles.includes('ROLE_ADMIN') ?? false,
  }), [state, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}