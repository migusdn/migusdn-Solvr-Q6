// server/src/routes/sleepStatsRoutes.ts
import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createSleepStatsController } from '../controllers/sleepStatsController'
import { authenticate } from '../middlewares/auth'

// 수면 통계 관련 라우트 등록
export const createSleepStatsRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const sleepStatsController = createSleepStatsController({
    sleepStatsService: context.sleepStatsService
  })

  // 인증 미들웨어 등록
  fastify.addHook('onRequest', authenticate)

  // 종합 수면 통계 조회
  fastify.get('/summary', sleepStatsController.getSummary)

  // 기간별 수면 통계 조회
  fastify.get('/period', sleepStatsController.getPeriodStats)

  // 수면 인사이트 조회
  fastify.get('/insights', sleepStatsController.getInsights)
}