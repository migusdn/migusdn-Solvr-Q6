// Authentication hook for context consumption

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 인증 컨텍스트에 접근하기 위한 커스텀 훅
 * 
 * @returns 인증 컨텍스트 값 (인증 상태, 사용자 정보, 로딩 상태, 오류, 인증 관련 함수들)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // 네비게이션 기능이 추가된 확장 함수들
  const loginWithRedirect = async (email: string, password: string) => {
    try {
      await context.login(email, password);
      navigate('/');
    } catch (error) {
      // 오류는 컨텍스트에서 이미 처리됨
    }
  };

  const registerWithRedirect = async (name: string, email: string, password: string) => {
    try {
      await context.register(name, email, password);
      navigate('/login');
    } catch (error) {
      // 오류는 컨텍스트에서 이미 처리됨
    }
  };

  const logoutWithRedirect = () => {
    context.logout();
    navigate('/login');
  };

  return {
    ...context,
    login: loginWithRedirect,
    register: registerWithRedirect,
    logout: logoutWithRedirect
  };
};

export default useAuth;
