import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createSleepLogController } from '../controllers/sleepLogController'

// 수면 기록 관련 라우트 등록
export const createSleepLogRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const sleepLogController = createSleepLogController({ sleepLogService: context.sleepLogService })

  // 모든 수면 기록 조회
  fastify.get('/', sleepLogController.getSleepLogs)

  // ID로 수면 기록 조회
  fastify.get('/:id', sleepLogController.getSleepLogById)

  // 사용자 ID로 수면 기록 조회
  fastify.get('/user/:userId', sleepLogController.getSleepLogsByUserId)

  // 수면 기록 생성
  fastify.post('/', sleepLogController.createSleepLog)

  // 수면 기록 수정
  fastify.put('/:id', sleepLogController.updateSleepLog)

  // 수면 기록 삭제
  fastify.delete('/:id', sleepLogController.deleteSleepLog)
}