import { FastifyRequest, FastifyReply } from 'fastify'
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '../utils/response'
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLogFilterDto } from '../types'
import { SleepLogService } from '../services/sleepLogService'

type SleepLogControllerDeps = {
  sleepLogService: SleepLogService
}

export const createSleepLogController = ({ sleepLogService }: SleepLogControllerDeps) => {
  const getSleepLogs = async (
    request: FastifyRequest<{ Querystring: SleepLogFilterDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { startDate, endDate, limit = 10, offset = 0 } = request.query
      const page = Math.floor(offset / limit) + 1

      const { data, total } = await sleepLogService.getSleepLogs({
        startDate,
        endDate,
        limit,
        offset
      })

      return reply.code(200).send(createPaginatedResponse(data, total, page, limit))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 목록을 불러오는데 실패했습니다.'))
    }
  }

  const getSleepLogById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const sleepLog = await sleepLogService.getSleepLogById(id)

      if (!sleepLog) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      return reply.code(200).send(createSuccessResponse(sleepLog))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 정보를 불러오는데 실패했습니다.'))
    }
  }

  const getSleepLogsByUserId = async (
    request: FastifyRequest<{ Params: { userId: string }; Querystring: SleepLogFilterDto }>,
    reply: FastifyReply
  ) => {
    try {
      const userId = parseInt(request.params.userId, 10)
      const { startDate, endDate, limit = 10, offset = 0 } = request.query
      const page = Math.floor(offset / limit) + 1

      if (isNaN(userId)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 사용자 ID입니다.'))
      }

      const { data, total } = await sleepLogService.getSleepLogsByUserId(userId, {
        startDate,
        endDate,
        limit,
        offset
      })

      return reply.code(200).send(createPaginatedResponse(data, total, page, limit))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('사용자의 수면 기록 목록을 불러오는데 실패했습니다.'))
    }
  }

  const createSleepLog = async (
    request: FastifyRequest<{ Body: CreateSleepLogDto }>,
    reply: FastifyReply
  ) => {
    try {
      const sleepLogData = request.body

      // 필수 필드 검증
      if (!sleepLogData.sleepTime || !sleepLogData.wakeTime) {
        return reply.code(400).send(createErrorResponse('취침 시간과 기상 시간은 필수 입력 항목입니다.'))
      }

      // 사용자 ID가 없는 경우 인증된 사용자의 ID 사용
      if (!sleepLogData.userId && request.user) {
        sleepLogData.userId = request.user.id
      }

      // 사용자 ID 검증
      if (!sleepLogData.userId) {
        return reply.code(400).send(createErrorResponse('사용자 ID는 필수 입력 항목입니다.'))
      }

      // 수면 시간 유효성 검증
      const sleepTime = new Date(sleepLogData.sleepTime)
      const wakeTime = new Date(sleepLogData.wakeTime)

      if (isNaN(sleepTime.getTime()) || isNaN(wakeTime.getTime())) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 날짜 형식입니다.'))
      }

      if (sleepTime >= wakeTime) {
        return reply.code(400).send(createErrorResponse('취침 시간은 기상 시간보다 이전이어야 합니다.'))
      }

      const newSleepLog = await sleepLogService.createSleepLog(sleepLogData)
      return reply
        .code(201)
        .send(createSuccessResponse(newSleepLog, '수면 기록이 성공적으로 생성되었습니다.'))
    } catch (error) {
      request.log.error(error)
      if (error instanceof Error && error.message.includes('취침 시간')) {
        return reply.code(400).send(createErrorResponse(error.message))
      }
      return reply.code(500).send(createErrorResponse('수면 기록 생성에 실패했습니다.'))
    }
  }

  const updateSleepLog = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSleepLogDto }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)
      const sleepLogData = request.body

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const existingSleepLog = await sleepLogService.getSleepLogById(id)
      if (!existingSleepLog) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      // 수면 시간 유효성 검증
      if (sleepLogData.sleepTime || sleepLogData.wakeTime) {
        const sleepTime = sleepLogData.sleepTime
          ? new Date(sleepLogData.sleepTime)
          : new Date(existingSleepLog.sleepTime)
        const wakeTime = sleepLogData.wakeTime
          ? new Date(sleepLogData.wakeTime)
          : new Date(existingSleepLog.wakeTime)

        if (isNaN(sleepTime.getTime()) || isNaN(wakeTime.getTime())) {
          return reply.code(400).send(createErrorResponse('유효하지 않은 날짜 형식입니다.'))
        }

        if (sleepTime >= wakeTime) {
          return reply.code(400).send(createErrorResponse('취침 시간은 기상 시간보다 이전이어야 합니다.'))
        }
      }

      const updatedSleepLog = await sleepLogService.updateSleepLog(id, sleepLogData)
      return reply
        .code(200)
        .send(createSuccessResponse(updatedSleepLog, '수면 기록이 성공적으로 수정되었습니다.'))
    } catch (error) {
      request.log.error(error)
      if (error instanceof Error && error.message.includes('취침 시간')) {
        return reply.code(400).send(createErrorResponse(error.message))
      }
      return reply.code(500).send(createErrorResponse('수면 기록 수정에 실패했습니다.'))
    }
  }

  const deleteSleepLog = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const existingSleepLog = await sleepLogService.getSleepLogById(id)
      if (!existingSleepLog) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      const deleted = await sleepLogService.deleteSleepLog(id)

      if (!deleted) {
        return reply.code(500).send(createErrorResponse('수면 기록 삭제에 실패했습니다.'))
      }

      return reply
        .code(200)
        .send(createSuccessResponse({ success: true }, '수면 기록이 성공적으로 삭제되었습니다.'))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 삭제에 실패했습니다.'))
    }
  }

  return {
    getSleepLogs,
    getSleepLogById,
    getSleepLogsByUserId,
    createSleepLog,
    updateSleepLog,
    deleteSleepLog
  }
}

export type SleepLogController = ReturnType<typeof createSleepLogController>
