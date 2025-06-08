import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createAuthController } from '../controllers/authController'

// 인증 관련 라우트 등록
export const createAuthRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const authController = createAuthController({ authService: context.authService })

  // 로그인
  fastify.post('/login', authController.login)

  // 회원가입
  fastify.post('/register', authController.register)

  // 토큰 갱신
  fastify.post('/refresh-token', authController.refreshToken)

  // 로그아웃
  fastify.post('/logout', authController.logout)
}
