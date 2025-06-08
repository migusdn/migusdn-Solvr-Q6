# TASK 7: [토큰 기반 인증 - FE]

## 7-1. 핵심 기능 목록
- 로그인 및 회원가입 UI 구현
- 토큰 기반 인증 상태 관리
- 보호된 라우트 접근 제어
- 인증 토큰 갱신 메커니즘

## 7-2. 프론트엔드 요구사항

### 7-2-1. 인증 관련 컴포넌트 구현
- 로그인 페이지: `pages/Login.tsx`
  - 이메일 및 비밀번호 입력 폼
  - 로그인 버튼 및 회원가입 링크
  - 오류 메시지 표시
- 회원가입 페이지: `pages/Register.tsx`
  - 이름, 이메일, 비밀번호 입력 폼
  - 회원가입 버튼 및 로그인 링크
  - 입력 유효성 검증 및 오류 메시지

### 7-2-2. 인증 상태 관리
- 인증 상태 관리 로직: `hooks/useAuth.ts`
  - 현재 인증 상태 (로그인 여부)
  - 사용자 정보 저장
  - 로그인, 로그아웃, 회원가입 기능
- 토큰 관리 유틸리티: `utils/tokenUtils.ts`
  - 액세스 토큰 저장 및 검색
  - 토큰 만료 확인
  - 토큰 갱신 로직

### 7-2-3. 보호된 라우트 구현
- 인증 필요 라우트 보호: `components/ProtectedRoute.tsx`
  - 로그인 상태 확인
  - 인증되지 않은 사용자 리디렉션
- 라우팅 구성: `App.tsx` 또는 `routes/index.tsx`
  - 공개 라우트와 보호된 라우트 분리

### 7-2-4. API 클라이언트 확장
- 인증 API 클라이언트: `services/authService.ts`
  - 로그인, 회원가입, 로그아웃, 토큰 갱신 API 호출
- Axios 인터셉터: `services/api.ts`
  - 요청 인터셉터: 액세스 토큰 자동 포함
  - 응답 인터셉터: 401 오류 시 토큰 갱신 처리

### 7-2-5. BE-FE 데이터 구조 및 통신 방법
- API 클라이언트 구현: Axios를 활용한 RESTful API 통신
- 인증 토큰 관리 전략: 
  - 액세스 토큰: 메모리 또는 localStorage 저장
  - 갱신 토큰: HttpOnly 쿠키 (서버에서 관리)
- TypeScript 인터페이스:

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
```

## 7-3. 인증 흐름 및 API 통합

### 7-3-1. 로그인 흐름
- 클라이언트 구현 예시:
```typescript
const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/api/auth/login', credentials);

    // 액세스 토큰 저장
    setAccessToken(response.data.accessToken);

    // 사용자 프로필 가져오기
    await fetchUserProfile();

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};
```

### 7-3-2. 회원가입 흐름
- 클라이언트 구현 예시:
```typescript
const register = async (userData: RegisterRequest): Promise<UserProfile> => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};
```

### 7-3-3. 토큰 갱신 메커니즘
- 클라이언트 구현 예시:
```typescript
const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/api/auth/refresh-token');

    // 새 액세스 토큰 저장
    setAccessToken(response.data.accessToken);

    return response.data;
  } catch (error) {
    // 갱신 실패 시 로그아웃 처리
    logout();
    throw handleAuthError(error);
  }
};
```

### 7-3-4. Axios 인터셉터 구현
- 클라이언트 구현 예시:
```typescript
// 요청 인터셉터: 액세스 토큰 포함
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 오류 시 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 오류이고 재시도하지 않았던 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        await refreshToken();

        // 토큰 갱신 후 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그인 페이지로 리디렉션
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 7-4. UI 컴포넌트 및 상호작용

### 7-4-1. 로그인 폼 구현
- 필수 입력 필드: 이메일, 비밀번호
- 유효성 검증:
  - 이메일 형식 검증
  - 비밀번호 최소 길이 확인
- 오류 메시지 표시
- 로딩 상태 표시

### 7-4-2. 회원가입 폼 구현
- 필수 입력 필드: 이름, 이메일, 비밀번호, 비밀번호 확인
- 유효성 검증:
  - 이메일 형식 검증
  - 비밀번호 강도 검증 (길이, 특수문자 등)
  - 비밀번호 일치 확인
- 오류 메시지 표시
- 로딩 상태 표시

### 7-4-3. 인증 상태 UI 표시
- 네비게이션 바에 로그인/로그아웃 상태 표시
- 로그인한 사용자 이름 표시
- 로그아웃 버튼 구현

### 7-4-4. 모바일 최적화
- 반응형 로그인/회원가입 폼
- 터치 친화적인 입력 필드 및 버튼
- 모바일에서의 가상 키보드 대응
