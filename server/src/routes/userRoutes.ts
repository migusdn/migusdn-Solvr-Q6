import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createUserController } from '../controllers/userController'
import { createAuthMiddleware, createRoleMiddleware } from '../utils/auth'

// 사용자 관련 라우트 등록
export const createUserRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const userController = createUserController({ userService: context.userService })
  const authMiddleware = createAuthMiddleware(context.authService)
  const adminMiddleware = createRoleMiddleware(context.authService, ['ADMIN'])

  // 인증 미들웨어 등록
  fastify.addHook('onRequest', authMiddleware)

  // 모든 사용자 조회 (관리자만 가능)
  fastify.get('/', { preHandler: adminMiddleware }, userController.getAllUsers)

  // ID로 사용자 조회
  fastify.get('/:id', userController.getUserById)

  // 사용자 생성 (관리자만 가능)
  fastify.post('/', { preHandler: adminMiddleware }, userController.createUser)

  // 사용자 수정 (관리자만 가능)
  fastify.put('/:id', { preHandler: adminMiddleware }, userController.updateUser)

  // 사용자 삭제 (관리자만 가능)
  fastify.delete('/:id', { preHandler: adminMiddleware }, userController.deleteUser)
}
