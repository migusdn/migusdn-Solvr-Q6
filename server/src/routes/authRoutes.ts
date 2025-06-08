import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createAuthController } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'

// 인증 관련 라우트 등록
export const createAuthRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const authController = createAuthController({ authService: context.authService })

  // 로그인
  fastify.post('/login', authController.login)

  // 회원가입
  fastify.post('/register', authController.register)

  // 토큰 갱신 (인증 필요)
  fastify.post('/refresh-token', { preHandler: authenticate }, authController.refreshToken)

  // 로그아웃 (인증 필요)
  fastify.post('/logout', { preHandler: authenticate }, authController.logout)

  // 현재 사용자 정보 조회 (인증 필요)
  fastify.get('/me', { preHandler: authenticate }, authController.getCurrentUser)
}
