// Token management utilities

/**
 * 액세스 토큰 저장소 키
 */
const ACCESS_TOKEN_KEY = 'access_token';

/**
 * 액세스 토큰을 로컬 스토리지에 저장
 * @param token 저장할 액세스 토큰
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * 로컬 스토리지에서 액세스 토큰 가져오기
 * @returns 저장된 액세스 토큰 또는 null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * 로컬 스토리지에서 액세스 토큰 제거
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * JWT 토큰 디코딩
 * @param token JWT 토큰
 * @returns 디코딩된 토큰 페이로드
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
};

/**
 * 토큰 만료 여부 확인
 * @param token JWT 토큰
 * @returns 만료 여부 (true: 만료됨, false: 유효함)
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // 현재 시간(초 단위)과 만료 시간 비교
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * 토큰 유효성 검사
 * @returns 토큰 유효 여부
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
};