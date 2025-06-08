// Authentication hook for state management

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, UserProfile } from '../types/auth';
import authService from '../services/authService';
import { isAuthenticated, getAccessToken } from '../utils/tokenUtils';

/**
 * 인증 상태 관리 훅
 * @returns 인증 상태 및 관련 함수들
 */
export const useAuth = () => {
  const navigate = useNavigate();
  
  // 초기 인증 상태
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: isAuthenticated(),
    user: null,
    loading: true,
    error: null
  });
  
  /**
   * 사용자 프로필 조회
   */
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      setAuthState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
      return;
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
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
        error: error instanceof Error ? error.message : '사용자 정보를 불러오는데 실패했습니다.'
      });
    }
  }, []);
  
  /**
   * 로그인 처리
   * @param email 이메일
   * @param password 비밀번호
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.login({ email, password });
      await fetchUserProfile();
      navigate('/');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.'
      }));
    }
  }, [fetchUserProfile, navigate]);
  
  /**
   * 회원가입 처리
   * @param name 이름
   * @param email 이메일
   * @param password 비밀번호
   */
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.register({ name, email, password });
      navigate('/login');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다.'
      }));
    }
  }, [navigate]);
  
  /**
   * 로그아웃 처리
   */
  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    navigate('/login');
  }, [navigate]);
  
  /**
   * 토큰 갱신 처리
   */
  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);
  
  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  
  // 토큰 갱신 이벤트 리스너
  useEffect(() => {
    const handleTokenRefresh = () => {
      refreshToken();
    };
    
    const handleLogout = () => {
      logout();
    };
    
    window.addEventListener('auth:token-refresh-needed', handleTokenRefresh);
    window.addEventListener('auth:logout-needed', handleLogout);
    
    return () => {
      window.removeEventListener('auth:token-refresh-needed', handleTokenRefresh);
      window.removeEventListener('auth:logout-needed', handleLogout);
    };
  }, [refreshToken, logout]);
  
  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken
  };
};

export default useAuth;