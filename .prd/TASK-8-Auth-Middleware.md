# TASK 8: [인증 미들웨어 및 보안 통합]

## 8-1. 핵심 기능 목록
- 인증 미들웨어 구현 및 통합
- API 라우트 보안 설정
- 보안 모범 사례 적용
- 권한 기반 접근 제어 (선택적)

## 8-2. 백엔드 요구사항

### 8-2-1. 인증 미들웨어 구현
- JWT 토큰 검증 미들웨어: `server/src/middlewares/auth.ts`
  - 요청 헤더에서 토큰 추출
  - 토큰 유효성 검증
  - 사용자 정보 요청 객체에 첨부
- 역할 기반 접근 제어 미들웨어 (선택적): `server/src/middlewares/roleAuth.ts`
  - 사용자 역할 검증
  - 특정 역할에만 접근 허용

### 8-2-2. 보안 설정 및 헤더
- 보안 헤더 미들웨어: `server/src/middlewares/security.ts`
  - CORS 설정
  - Content-Security-Policy
  - XSS 방지
  - CSRF 보호

### 8-2-3. 오류 처리 및 로깅
- 인증 오류 처리 미들웨어: `server/src/middlewares/errorHandler.ts`
  - 인증 관련 오류 포맷팅
  - 적절한 HTTP 상태 코드 반환
- 보안 로깅 미들웨어: `server/src/middlewares/securityLogger.ts`
  - 인증 시도 로깅
  - 실패한 인증 시도 추적

## 8-3. 프론트엔드 요구사항

### 8-3-1. 인증 상태 전역 관리
- 인증 컨텍스트 제공자: `client/src/contexts/AuthContext.tsx`
  - 전역 인증 상태 관리
  - 인증 관련 함수 제공
- 인증 상태 훅: `client/src/hooks/useAuth.ts`
  - 인증 컨텍스트 소비 간소화

### 8-3-2. 보호된 라우트 구현
- 보호된 라우트 컴포넌트: `client/src/components/ProtectedRoute.tsx`
  - 인증 상태 확인
  - 비인증 사용자 리디렉션
- 권한 기반 라우트 (선택적): `client/src/components/RoleBasedRoute.tsx`
  - 특정 역할에 대한 접근 제어

### 8-3-3. 인증 상태 지속성
- 새로고침 시 인증 상태 복원
- 토큰 만료 시 자동 로그아웃

## 8-4. 미들웨어 구현 상세

### 8-4-1. JWT 인증 미들웨어
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// 요청에 추가될 사용자 정보 타입 확장
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      role: string;
    };
  }
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '인증 토큰이 필요합니다'
      });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
      role: string;
    };

    // 사용자 존재 여부 확인 (선택적)
    const user = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user.length) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '사용자를 찾을 수 없습니다'
      });
    }

    // 요청 객체에 사용자 정보 첨부
    request.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: '유효하지 않은 토큰이거나 만료되었습니다'
    });
  }
};
```

### 8-4-2. 역할 기반 접근 제어 미들웨어
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

export const checkRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 사용자 정보가 없으면 인증되지 않은 상태
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '인증이 필요합니다'
      });
    }

    // 역할 확인
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: '이 작업을 수행할 권한이 없습니다'
      });
    }
  };
};
```

### 8-4-3. 보안 헤더 미들웨어
```typescript
import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';

export const setupSecurityMiddleware = async (server: FastifyInstance) => {
  // CORS 설정
  await server.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // 보안 헤더 설정
  server.addHook('onSend', (request, reply, payload, done) => {
    reply.headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    done();
  });
};
```

## 8-5. API 보안 통합

### 8-5-1. 보호된 라우트 설정
```typescript
// 수면 기록 라우트에 인증 미들웨어 적용 예시
import { FastifyInstance } from 'fastify';
import { authenticate } from '../middlewares/auth';
import { checkRole } from '../middlewares/roleAuth';
import * as sleepLogController from '../controllers/sleepLogController';

export default async function (fastify: FastifyInstance) {
  // 공개 라우트 (인증 불필요)
  fastify.get('/api/health', sleepLogController.healthCheck);

  // 인증 필요 라우트
  fastify.register(async (protectedRoutes) => {
    // 모든 라우트에 인증 미들웨어 적용
    protectedRoutes.addHook('onRequest', authenticate);

    // 수면 기록 라우트
    protectedRoutes.get('/api/sleep-logs', sleepLogController.getSleepLogs);
    protectedRoutes.get('/api/sleep-logs/:id', sleepLogController.getSleepLogById);
    protectedRoutes.post('/api/sleep-logs', sleepLogController.createSleepLog);
    protectedRoutes.put('/api/sleep-logs/:id', sleepLogController.updateSleepLog);
    protectedRoutes.delete('/api/sleep-logs/:id', sleepLogController.deleteSleepLog);

    // 관리자 전용 라우트
    protectedRoutes.register(async (adminRoutes) => {
      adminRoutes.addHook('onRequest', checkRole(['ADMIN']));

      adminRoutes.get('/api/admin/users', sleepLogController.getAllUsers);
      adminRoutes.delete('/api/admin/users/:id', sleepLogController.deleteUser);
    });
  });
}
```

### 8-5-2. 프론트엔드 보호된 라우트 구현
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 로딩 중 처리
  if (loading) {
    return <div>인증 확인 중...</div>;
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 역할 기반 접근 제어 (선택적)
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## 8-6. 보안 모범 사례 적용

### 8-6-1. 백엔드 보안 강화
- 민감한 데이터 암호화 (비밀번호, 개인정보)
- 토큰 만료 시간 적절히 설정
- 비밀번호 해싱에 bcrypt 사용
- 환경 변수를 통한 비밀 관리
- 토큰 재사용 방지 메커니즘

### 8-6-2. 프론트엔드 보안 강화
- 민감한 정보 클라이언트에 저장 금지
- 액세스 토큰만 메모리에 저장 (localStorage 대신)
- CSRF 방어 기법 적용
- 사용자 입력 데이터 검증 및 이스케이프

### 8-6-3. 통신 보안
- HTTPS 사용 강제
- 보안 쿠키 속성 활용 (HttpOnly, Secure, SameSite)
- API 요청 제한 (Rate Limiting)
