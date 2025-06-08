// server/src/services/sleepLogService.ts
import { eq, and, gte, lte } from 'drizzle-orm'
import { sleepLogs } from '../db/schema'
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLog, SleepLogFilterDto } from '../types'
import { Database } from '../types/database'

type SleepLogServiceDeps = {
  db: Database
}

// 수면 시간 계산 함수 (분 단위)
const calculateSleepDuration = (sleepTime: string, wakeTime: string): number => {
  const sleepDate = new Date(sleepTime)
  const wakeDate = new Date(wakeTime)
  
  // 밀리초 단위 차이를 분 단위로 변환
  return Math.round((wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60))
}

export const createSleepLogService = ({ db }: SleepLogServiceDeps) => {
  const getSleepLogs = async (filter?: SleepLogFilterDto): Promise<{ data: SleepLog[]; total: number }> => {
    const { startDate, endDate, limit = 10, offset = 0 } = filter || {}
    
    let query = db.select().from(sleepLogs)
    
    // 날짜 필터 적용
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(sleepLogs.sleepTime, startDate),
          lte(sleepLogs.wakeTime, endDate)
        )
      )
    } else if (startDate) {
      query = query.where(gte(sleepLogs.sleepTime, startDate))
    } else if (endDate) {
      query = query.where(lte(sleepLogs.wakeTime, endDate))
    }
    
    // 전체 개수 조회
    const countQuery = db.select({ count: db.fn.count() }).from(sleepLogs)
    const [{ count }] = await countQuery
    
    // 페이지네이션 적용
    query = query.limit(limit).offset(offset)
    
    const data = await query
    return { data, total: Number(count) }
  }

  const getSleepLogById = async (id: number): Promise<SleepLog | undefined> => {
    const result = await db.select().from(sleepLogs).where(eq(sleepLogs.id, id)).limit(1)
    return result[0]
  }

  const getSleepLogsByUserId = async (userId: number, filter?: SleepLogFilterDto): Promise<{ data: SleepLog[]; total: number }> => {
    const { startDate, endDate, limit = 10, offset = 0 } = filter || {}
    
    let query = db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId))
    
    // 날짜 필터 적용
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(sleepLogs.sleepTime, startDate),
          lte(sleepLogs.wakeTime, endDate)
        )
      )
    } else if (startDate) {
      query = query.where(gte(sleepLogs.sleepTime, startDate))
    } else if (endDate) {
      query = query.where(lte(sleepLogs.wakeTime, endDate))
    }
    
    // 전체 개수 조회
    const countQuery = db.select({ count: db.fn.count() }).from(sleepLogs).where(eq(sleepLogs.userId, userId))
    const [{ count }] = await countQuery
    
    // 페이지네이션 적용
    query = query.limit(limit).offset(offset)
    
    const data = await query
    return { data, total: Number(count) }
  }

  const createSleepLog = async (sleepLogData: CreateSleepLogDto): Promise<SleepLog> => {
    // 수면 시간 유효성 검증
    const sleepTime = new Date(sleepLogData.sleepTime)
    const wakeTime = new Date(sleepLogData.wakeTime)
    
    if (sleepTime >= wakeTime) {
      throw new Error('취침 시간은 기상 시간보다 이전이어야 합니다.')
    }
    
    // 수면 시간 계산
    const sleepDuration = calculateSleepDuration(sleepLogData.sleepTime, sleepLogData.wakeTime)
    
    const now = new Date().toISOString()
    const newSleepLog = {
      ...sleepLogData,
      sleepDuration,
      createdAt: now,
      updatedAt: now
    }

    const result = await db.insert(sleepLogs).values(newSleepLog).returning()
    return result[0]
  }

  const updateSleepLog = async (id: number, sleepLogData: UpdateSleepLogDto): Promise<SleepLog | undefined> => {
    // 기존 데이터 조회
    const existingSleepLog = await getSleepLogById(id)
    if (!existingSleepLog) {
      return undefined
    }
    
    // 수면 시간 계산을 위한 데이터 준비
    const sleepTime = sleepLogData.sleepTime || existingSleepLog.sleepTime
    const wakeTime = sleepLogData.wakeTime || existingSleepLog.wakeTime
    
    // 수면 시간 유효성 검증
    const sleepDate = new Date(sleepTime)
    const wakeDate = new Date(wakeTime)
    
    if (sleepDate >= wakeDate) {
      throw new Error('취침 시간은 기상 시간보다 이전이어야 합니다.')
    }
    
    // 수면 시간 계산
    const sleepDuration = calculateSleepDuration(sleepTime, wakeTime)
    
    const now = new Date().toISOString()
    const updateData = {
      ...sleepLogData,
      sleepDuration,
      updatedAt: now
    }

    const result = await db.update(sleepLogs).set(updateData).where(eq(sleepLogs.id, id)).returning()
    return result[0]
  }

  const deleteSleepLog = async (id: number): Promise<boolean> => {
    const result = await db.delete(sleepLogs).where(eq(sleepLogs.id, id)).returning({ id: sleepLogs.id })
    return result.length > 0
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

export type SleepLogService = ReturnType<typeof createSleepLogService>