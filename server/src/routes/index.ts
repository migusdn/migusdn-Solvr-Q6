import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createUserRoutes } from './userRoutes'
import { createSleepLogRoutes } from './sleepLogRoutes'
import { createSleepStatsRoutes } from './sleepStatsRoutes'
import { createSleepAIRoutes } from './sleepAIRoutes'
import { createAuthRoutes } from './authRoutes'
import healthRoutes from './healthRoutes'

// 모든 라우트 등록
export const createRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  // 헬스 체크 라우트
  fastify.register(healthRoutes, { prefix: '/api/health' })

  // 인증 관련 라우트
  fastify.register(createAuthRoutes(context), { prefix: '/api/auth' })

  // 사용자 관련 라우트
  fastify.register(createUserRoutes(context), { prefix: '/api/users' })

  // 수면 기록 관련 라우트
  fastify.register(createSleepLogRoutes(context), { prefix: '/api/sleep-logs' })

  // 수면 통계 관련 라우트
  fastify.register(createSleepStatsRoutes(context), { prefix: '/api/sleep-stats' })

  // 수면 AI 분석 관련 라우트
  fastify.register(createSleepAIRoutes(context), { prefix: '/api/sleep-stats' })
}
