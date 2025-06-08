import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { AuthState } from '../types/auth';
import authService from '../services/authService';
import { getAccessToken, isTokenExpired } from '../utils/tokenUtils';

// 인증 컨텍스트 인터페이스 정의
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// 기본 컨텍스트 값 설정
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshAuth: async () => {}
};

// 인증 컨텍스트 생성
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // 인증 상태 초기화 및 토큰 유효성 검사
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken();

        // 토큰이 없거나 만료된 경우
        if (!token || isTokenExpired(token)) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
          return;
        }

        // 토큰이 유효한 경우 사용자 정보 가져오기
        const user = await authService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : '인증 초기화 중 오류가 발생했습니다'
        });
      }
    };

    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 로그인 API 호출
      await authService.login({ email, password });

      // 사용자 정보 가져오기
      const user = await authService.getCurrentUser();

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 회원가입 함수
  const register = async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 회원가입 API 호출
      await authService.register({ name, email, password });

      setAuthState(prev => ({
        ...prev,
        loading: false
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  };

  // 인증 갱신 함수
  const refreshAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      // 토큰 갱신 API 호출
      await authService.refreshToken();

      // 사용자 정보 가져오기
      const user = await authService.getCurrentUser();

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      // 갱신 실패 시 로그아웃 처리
      logout();
      throw error;
    }
  };

  // 컨텍스트 값 설정
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
