// Authentication service for API calls

import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../types/auth';
import { setAccessToken, removeAccessToken } from '../utils/tokenUtils';

/**
 * 인증 관련 API 에러 처리
 * @param error API 에러 객체
 * @returns 처리된 에러 객체
 */
const handleAuthError = (error: any): Error => {
  const errorMessage = error.response?.data?.message || '인증 처리 중 오류가 발생했습니다.';
  return new Error(errorMessage);
};

/**
 * 인증 서비스
 */
const authService = {
  /**
   * 로그인 API 호출
   * @param credentials 로그인 정보 (이메일, 비밀번호)
   * @returns 인증 응답 (액세스 토큰, 만료 시간)
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
      
      // 액세스 토큰 저장
      if (response.data.data.accessToken) {
        setAccessToken(response.data.data.accessToken);
      }
      
      return response.data.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
  
  /**
   * 회원가입 API 호출
   * @param userData 회원가입 정보 (이름, 이메일, 비밀번호)
   * @returns 생성된 사용자 프로필
   */
  register: async (userData: RegisterRequest): Promise<UserProfile> => {
    try {
      const response = await api.post<{ data: UserProfile }>('/auth/register', userData);
      return response.data.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
  
  /**
   * 로그아웃 처리
   */
  logout: (): void => {
    removeAccessToken();
  },
  
  /**
   * 토큰 갱신 API 호출
   * @returns 새로운 인증 응답 (액세스 토큰, 만료 시간)
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: AuthResponse }>('/auth/refresh-token');
      
      // 새 액세스 토큰 저장
      if (response.data.data.accessToken) {
        setAccessToken(response.data.data.accessToken);
      }
      
      return response.data.data;
    } catch (error) {
      // 갱신 실패 시 로그아웃 처리
      authService.logout();
      throw handleAuthError(error);
    }
  },
  
  /**
   * 현재 사용자 프로필 조회 API 호출
   * @returns 사용자 프로필
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<{ data: UserProfile }>('/auth/me');
      return response.data.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  }
};

export default authService;