import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createUserController } from '../controllers/userController'
import { authenticate } from '../middlewares/auth'
import { checkRole } from '../middlewares/roleAuth'
import { CreateUserDto, UpdateUserDto } from '../types'

// 사용자 관련 라우트 등록
export const createUserRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const userController = createUserController({ userService: context.userService })

  // 인증 미들웨어 등록
  fastify.addHook('onRequest', authenticate)

  // 모든 사용자 조회 (관리자만 가능)
  fastify.get('/', { preHandler: checkRole(['ADMIN']) }, userController.getAllUsers)

  // ID로 사용자 조회
  fastify.get<{ Params: { id: string } }>('/:id', userController.getUserById)

  // 사용자 생성 (관리자만 가능)
  fastify.post<{ Body: CreateUserDto }>('/', { preHandler: checkRole(['ADMIN']) }, userController.createUser)

  // 사용자 수정 (관리자만 가능)
  fastify.put<{ Params: { id: string }; Body: UpdateUserDto }>('/:id', { preHandler: checkRole(['ADMIN']) }, userController.updateUser)

  // 사용자 삭제 (관리자만 가능)
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: checkRole(['ADMIN']) }, userController.deleteUser)
}
