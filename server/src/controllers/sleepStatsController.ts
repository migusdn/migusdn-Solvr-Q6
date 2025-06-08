// server/src/controllers/sleepStatsController.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { createSuccessResponse, createErrorResponse } from '../utils/response'
import { SleepStatsService } from '../services/sleepStatsService'

// 요청 파라미터 타입 정의
interface SleepStatsSummaryParams {
  Querystring: {
    userId?: string
    startDate?: string
    endDate?: string
  }
}

interface SleepStatsPeriodParams {
  Querystring: {
    userId?: string
    period?: string
    startDate?: string
    endDate?: string
  }
}

interface SleepStatsInsightsParams {
  Querystring: {
    userId?: string
  }
}

type SleepStatsControllerDeps = {
  sleepStatsService: SleepStatsService
}

export const createSleepStatsController = ({ sleepStatsService }: SleepStatsControllerDeps) => {
  // 종합 수면 통계 조회
  const getSummary = async (
    request: FastifyRequest<SleepStatsSummaryParams>,
    reply: FastifyReply
  ) => {
    try {
      const { userId: userIdParam, startDate, endDate } = request.query

      // 사용자 ID 확인
      let userId: number
      if (userIdParam) {
        userId = parseInt(userIdParam, 10)
        if (isNaN(userId)) {
          return reply.code(400).send(createErrorResponse('유효하지 않은 사용자 ID입니다.'))
        }
      } else if (request.user) {
        // 인증된 사용자의 ID 사용
        userId = request.user.id
      } else {
        return reply.code(400).send(createErrorResponse('사용자 ID는 필수 입력 항목입니다.'))
      }

      // 권한 확인 (자신의 데이터만 조회 가능)
      if (request.user && request.user.id !== userId && request.user.role !== 'ADMIN') {
        return reply.code(403).send(createErrorResponse('다른 사용자의 데이터에 접근할 권한이 없습니다.'))
      }

      // 날짜 형식 검증
      if (startDate && !isValidDateFormat(startDate)) {
        return reply.code(400).send(createErrorResponse('시작 날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.'))
      }
      if (endDate && !isValidDateFormat(endDate)) {
        return reply.code(400).send(createErrorResponse('종료 날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.'))
      }

      // 서비스 호출
      const summaryData = await sleepStatsService.getSummary(userId, startDate || '', endDate || '')
      return reply.code(200).send(createSuccessResponse(summaryData))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 통계 정보를 불러오는데 실패했습니다.'))
    }
  }

  // 기간별 수면 통계 조회
  const getPeriodStats = async (
    request: FastifyRequest<SleepStatsPeriodParams>,
    reply: FastifyReply
  ) => {
    try {
      const { userId: userIdParam, period = 'daily', startDate, endDate } = request.query

      // 사용자 ID 확인
      let userId: number
      if (userIdParam) {
        userId = parseInt(userIdParam, 10)
        if (isNaN(userId)) {
          return reply.code(400).send(createErrorResponse('유효하지 않은 사용자 ID입니다.'))
        }
      } else if (request.user) {
        // 인증된 사용자의 ID 사용
        userId = request.user.id
      } else {
        return reply.code(400).send(createErrorResponse('사용자 ID는 필수 입력 항목입니다.'))
      }

      // 권한 확인 (자신의 데이터만 조회 가능)
      if (request.user && request.user.id !== userId && request.user.role !== 'ADMIN') {
        return reply.code(403).send(createErrorResponse('다른 사용자의 데이터에 접근할 권한이 없습니다.'))
      }

      // 기간 유효성 검증
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 기간입니다. daily, weekly, monthly, yearly 중 하나여야 합니다.'))
      }

      // 날짜 형식 검증
      if (startDate && !isValidDateFormat(startDate)) {
        return reply.code(400).send(createErrorResponse('시작 날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.'))
      }
      if (endDate && !isValidDateFormat(endDate)) {
        return reply.code(400).send(createErrorResponse('종료 날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.'))
      }

      // 서비스 호출
      const periodStats = await sleepStatsService.getPeriodStats(
        userId,
        period,
        startDate || '',
        endDate || ''
      )

      // 데이터가 없는 경우
      if (periodStats.length === 0) {
        return reply.code(404).send(createErrorResponse('해당 기간의 수면 기록이 없습니다.'))
      }

      return reply.code(200).send(createSuccessResponse({ periodStats }))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('기간별 수면 통계 정보를 불러오는데 실패했습니다.'))
    }
  }

  // 수면 인사이트 조회
  const getInsights = async (
    request: FastifyRequest<SleepStatsInsightsParams>,
    reply: FastifyReply
  ) => {
    try {
      const { userId: userIdParam } = request.query

      // 사용자 ID 확인
      let userId: number
      if (userIdParam) {
        userId = parseInt(userIdParam, 10)
        if (isNaN(userId)) {
          return reply.code(400).send(createErrorResponse('유효하지 않은 사용자 ID입니다.'))
        }
      } else if (request.user) {
        // 인증된 사용자의 ID 사용
        userId = request.user.id
      } else {
        return reply.code(400).send(createErrorResponse('사용자 ID는 필수 입력 항목입니다.'))
      }

      // 권한 확인 (자신의 데이터만 조회 가능)
      if (request.user && request.user.id !== userId && request.user.role !== 'ADMIN') {
        return reply.code(403).send(createErrorResponse('다른 사용자의 데이터에 접근할 권한이 없습니다.'))
      }

      // 서비스 호출
      const insights = await sleepStatsService.getInsights(userId)
      return reply.code(200).send(createSuccessResponse({ insights }))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 인사이트 정보를 불러오는데 실패했습니다.'))
    }
  }

  return {
    getSummary,
    getPeriodStats,
    getInsights
  }
}

// 날짜 형식 검증 함수 (YYYY-MM-DD)
function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export type SleepStatsController = ReturnType<typeof createSleepStatsController>