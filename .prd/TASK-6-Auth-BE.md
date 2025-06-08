# TASK 6: [토큰 기반 인증 - BE]

## 6-1. 핵심 기능 목록
- 사용자 인증 시스템 구현
- JWT 토큰 생성 및 검증
- 보안 미들웨어 구현
- 토큰 갱신 메커니즘

## 6-2. 백엔드 요구사항

### 6-2-1. 사용자 스키마 및 인증 모델 확장
- 사용자 모델에 비밀번호 필드 추가
- 비밀번호 해싱 기능 구현
- 사용자 인증 관련 서비스 로직 개발

### 6-2-2. 인증 API 엔드포인트 구현
- 로그인 API: `POST /api/auth/login`
- 회원가입 API: `POST /api/auth/register`
- 토큰 갱신 API: `POST /api/auth/refresh-token`
- 로그아웃 API: `POST /api/auth/logout`

### 6-2-3. JWT 토큰 관리
- JWT 토큰 발급 및 서명
  - Access Token: 짧은 만료 시간 (15-30분)
  - Refresh Token: 긴 만료 시간 (7-14일)
- 토큰 검증 및 해독 로직 구현
- 토큰 블랙리스트 관리 (로그아웃 처리)

### 6-2-4. 인증 미들웨어 구현
- 보호된 라우트에 적용할 인증 미들웨어 개발
- 권한 검증 미들웨어 개발 (선택적)

### 6-2-5. BE-FE 데이터 구조 및 통신 방법
- REST API를 통한 토큰 기반 인증
- 토큰 전송 메커니즘: Authorization 헤더 (Bearer 스키마)
- 갱신 토큰은 HTTP Only 쿠키로 안전하게 관리

## 6-3. API 명세

### 6-3-1. 로그인 API
- 엔드포인트: `POST /api/auth/login`
- 요청 파라미터:
```json
{
  "email": "string",
  "password": "string"
}
```
- 응답 형식:
```json
{
  "accessToken": "string",
  "expiresIn": "number"
}
```
- 헤더 응답:
  - `Set-Cookie`: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=1209600
- 오류 코드:
  - 401: 인증 실패 (잘못된 이메일 또는 비밀번호)
  - 400: 잘못된 요청 (필수 필드 누락)
  - 500: 서버 오류

### 6-3-2. 회원가입 API
- 엔드포인트: `POST /api/auth/register`
- 요청 파라미터:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
- 응답 형식:
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "role": "string",
  "createdAt": "string"
}
```
- 오류 코드:
  - 400: 잘못된 요청 (필수 필드 누락 또는 유효성 검증 실패)
  - 409: 이메일 중복
  - 500: 서버 오류

### 6-3-3. 토큰 갱신 API
- 엔드포인트: `POST /api/auth/refresh-token`
- 요청 파라미터: 없음 (쿠키에서 갱신 토큰 추출)
- 응답 형식:
```json
{
  "accessToken": "string",
  "expiresIn": "number"
}
```
- 헤더 응답:
  - `Set-Cookie`: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=1209600
- 오류 코드:
  - 401: 갱신 토큰 없음 또는 만료됨
  - 403: 갱신 토큰이 블랙리스트에 있음 (로그아웃 상태)
  - 500: 서버 오류

### 6-3-4. 로그아웃 API
- 엔드포인트: `POST /api/auth/logout`
- 요청 파라미터: 없음
- 응답 형식:
```json
{
  "success": true
}
```
- 헤더 응답:
  - `Set-Cookie`: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=0
- 오류 코드:
  - 500: 서버 오류

### 6-3-5. 인증 미들웨어 및 보호된 API
- 인증 필요 헤더: `Authorization: Bearer <accessToken>`
- 인증 실패 응답:
```json
{
  "error": "Unauthorized",
  "message": "유효하지 않은 토큰 또는 토큰 만료"
}
```
- 오류 코드:
  - 401: 인증 토큰 없음 또는 유효하지 않음
  - 403: 권한 없음 (역할 기반 접근 제어 실패)
