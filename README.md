# 수면 트래커 및 분석 서비스

## 프로젝트 개요

이 프로젝트는 사용자의 수면 데이터를 기록하고 분석하는 웹 애플리케이션입니다. monorepo 구조로 클라이언트와 서버를 효율적으로 관리하며, 현대적인 웹 개발 기술 스택을 활용합니다. 사용자는 수면 시간, 품질 등을 기록하고, AI 기반 분석을 통해 수면 패턴에 대한 인사이트를 얻을 수 있습니다.

이 애플리케이션은 데스크톱과 모바일 환경 모두에 최적화되어 있어, 어떤 디바이스에서도 편리하게 사용할 수 있습니다. 반응형 디자인을 통해 화면 크기에 따라 자동으로 레이아웃이 조정되며, 모바일에서는 스와이프 제스처를 통한 직관적인 조작이 가능합니다.

## 기술 스택

### 공통

- 패키지 매니저: pnpm (workspace 기능 활용)
- 언어: TypeScript
- Node.js 버전: 22.x
- 테스트: Vitest
- 코드 품질: Prettier

### 클라이언트

- 프레임워크: React
- 빌드 도구: Vite
- 라우팅: React Router
- 스타일링: TailwindCSS

### 서버

- 프레임워크: Fastify
- 데이터베이스: SQLite with DirzzleORM

## 프로젝트 구조

```
/
├── client/                # 클라이언트 애플리케이션
│   ├── public/            # 정적 파일
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   │   ├── sleep-tracker/  # 수면 트래커 관련 컴포넌트
│   │   │   ├── sleep-stats/    # 수면 통계 관련 컴포넌트
│   │   │   ├── auth/           # 인증 관련 컴포넌트
│   │   │   └── ui/             # 공통 UI 컴포넌트
│   │   ├── hooks/         # 커스텀 React 훅
│   │   ├── layouts/       # 레이아웃 컴포넌트
│   │   ├── routes/        # 라우트 컴포넌트
│   │   ├── services/      # API 서비스
│   │   ├── types/         # TypeScript 타입 정의
│   │   ├── utils/         # 유틸리티 함수
│   │   ├── App.tsx        # 메인 애플리케이션 컴포넌트
│   │   └── main.tsx       # 애플리케이션 진입점
│   ├── package.json
│   └── vite.config.ts
├── server/                # 백엔드 서버
│   ├── src/
│   │   ├── controllers/   # API 컨트롤러
│   │   ├── db/            # 데이터베이스 관련 코드
│   │   ├── middleware/    # 미들웨어
│   │   ├── routes/        # API 라우트
│   │   ├── services/      # 비즈니스 로직
│   │   ├── types/         # TypeScript 타입 정의
│   │   ├── utils/         # 유틸리티 함수
│   │   └── index.ts       # 서버 진입점
│   ├── package.json
│   └── tsconfig.json
├── package.json           # 루트 패키지 설정
└── pnpm-workspace.yaml    # pnpm 워크스페이스 설정
```

## 설치 및 실행

### 요구사항

- Node.js 22.x 이상
- pnpm 8.x 이상

### 초기 설치

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/sleep-tracker.git
cd sleep-tracker

# 2. 패키지 설치
pnpm install

# 3. 환경 변수 설정
cp client/.env.example client/.env
cp server/.env.example server/.env
# 필요에 따라 .env 파일 수정

# 4. 데이터베이스 마이그레이션
pnpm db:migrate
```

### 개발 서버 실행

```bash
# 클라이언트 및 서버 동시 실행
pnpm dev

# 클라이언트만 실행
pnpm dev:client

# 서버만 실행
pnpm dev:server
```

### 테스트 실행

```bash
# 클라이언트 테스트
pnpm test:client

# 서버 테스트
pnpm test:server

# 모든 테스트 실행
pnpm test
```

### 빌드

```bash
# 클라이언트 및 서버 빌드
pnpm build

# 빌드된 애플리케이션 실행
pnpm start
```

## 환경 변수 설정

- 클라이언트: `client/.env` 파일에 설정 (예시는 `client/.env.example` 참조)
- 서버: `server/.env` 파일에 설정 (예시는 `server/.env.example` 참조)

## 브라우저 및 디바이스 지원

### 지원 브라우저
- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

### 지원 디바이스
- 데스크톱 (Windows, macOS, Linux)
- 태블릿 (iPad, Android 태블릿)
- 모바일 (iPhone, Android 스마트폰)

최소 권장 화면 크기: 320px (모바일)

## 주요 기능

### 수면 트래킹
- 수면 시간, 품질, 기상 시간 등 기록
- 일별, 주별, 월별, 연별 수면 데이터 통계 제공
- 수면 패턴 시각화 및 분석
- 스와이프 제스처를 통한 수면 기록 수정/삭제 (모바일)

### 수면 통계
- 수면 효율성, 일관성 계산
- 수면 품질 추세 분석
- 수면 패턴 차트 제공
- 반응형 차트로 모바일에서도 최적화된 시각화

### AI 수면 분석
- Google Gemini AI API를 활용한 수면 데이터 분석
- 개인화된 수면 인사이트 제공
- 수면 개선을 위한 맞춤형 권장사항 제공
- 모바일 친화적인 AI 분석 결과 표시

### 사용자 인증
- 회원가입 및 로그인 기능
- 인증 미들웨어를 통한 보안 강화
- 사용자별 데이터 분리 및 관리
- 모바일에 최적화된 인증 폼

### 반응형 디자인
- 데스크톱과 모바일 환경 모두에 최적화된 UI/UX
- 화면 크기에 따라 자동으로 조정되는 레이아웃
- 모바일에서의 터치 제스처 지원 (스와이프, 탭 등)
- 모바일 친화적인 폰트 크기 및 여백
- 터치 타겟 크기 최적화로 모바일 조작성 향상

## API 엔드포인트

서버는 다음과 같은 API 엔드포인트를 제공합니다:

### 인증
- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `GET /api/auth/me`: 현재 사용자 정보 조회

### 사용자
- `GET /api/users`: 유저 목록 조회
- `GET /api/users/:id`: 특정 유저 조회
- `PUT /api/users/:id`: 유저 정보 수정
- `DELETE /api/users/:id`: 유저 삭제

### 수면 트래킹
- `GET /api/sleep-logs`: 수면 기록 목록 조회
- `GET /api/sleep-logs/:id`: 특정 수면 기록 조회
- `POST /api/sleep-logs`: 새 수면 기록 추가
- `PUT /api/sleep-logs/:id`: 수면 기록 수정
- `DELETE /api/sleep-logs/:id`: 수면 기록 삭제

### 수면 통계
- `GET /api/sleep-stats/summary`: 수면 통계 요약 조회
- `GET /api/sleep-stats/trends`: 수면 추세 데이터 조회
- `GET /api/sleep-stats/patterns`: 수면 패턴 데이터 조회

### AI 수면 분석
- `GET /api/sleep-ai/analysis`: AI 수면 분석 결과 조회
- `POST /api/sleep-ai/generate`: 새로운 AI 수면 분석 생성

## ChangeLog

### 2023-06-09: 모바일 UI/UX 최적화
- 반응형 디자인 개선으로 모바일 사용성 향상
- 모바일 화면에서 스와이프 제스처 인디케이터 추가
- 모바일 환경에 맞는 폰트 크기 및 여백 조정
- 터치 타겟 크기 최적화로 모바일 조작성 개선
- 페이지네이션 컨트롤 모바일 최적화

### 2023-06-08: AI 수면 분석 기능 추가
- Google Gemini AI API 통합
- 수면 AI 분석 카드 컴포넌트 개발
- 수면 통계 대시보드에 AI 분석 카드 통합
- AI 응답 형식 최적화 및 JSON 포맷 강제
- 수면 인사이트 및 권장사항 기능 개선

### 2023-06-07: 수면 통계 기능 개발
- 수면 효율성, 일관성 계산 로직 구현
- 수면 패턴 차트 개발
- 일별/주별/월별/연별 통계 기능 추가

### 2023-06-06: 수면 트래커 기능 개발
- 수면 기록 CRUD 기능 구현
- 수면 데이터 시각화 컴포넌트 개발
- 더미 데이터 생성 기능 추가

### 2023-06-05: 인증 기능 개발
- 회원가입 및 로그인 기능 구현
- 인증 미들웨어 개발
- 사용자별 데이터 분리 기능 구현
