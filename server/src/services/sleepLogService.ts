// server/src/services/sleepLogService.ts
import { eq, and, gte, lte, sql, count } from 'drizzle-orm'
import { sleepLogs } from '../db/schema'
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLog, SleepLogFilterDto } from '../types'
import { Database } from '../types/database'
import { SQL } from 'drizzle-orm/sql'

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

    // 날짜 필터 조건 생성
    const whereConditions: SQL<unknown>[] = []

    if (startDate && endDate) {
      whereConditions.push(
        sql`${sleepLogs.sleepTime} >= ${startDate} AND ${sleepLogs.wakeTime} <= ${endDate}`
      );
    } else if (startDate) {
      whereConditions.push(sql`${sleepLogs.sleepTime} >= ${startDate}`)
    } else if (endDate) {
      whereConditions.push(sql`${sleepLogs.wakeTime} <= ${endDate}`)
    }

    // 데이터 조회
    let data: SleepLog[] = []
    if (whereConditions.length > 0) {
      data = await db.select().from(sleepLogs)
        .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
        .limit(limit)
        .offset(offset)
    } else {
      data = await db.select().from(sleepLogs)
        .limit(limit)
        .offset(offset)
    }

    // 전체 개수 조회
    let totalCount = 0
    if (whereConditions.length > 0) {
      const countResult = await db.select({ value: count() }).from(sleepLogs)
        .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      totalCount = Number(countResult[0]?.value || 0)
    } else {
      const countResult = await db.select({ value: count() }).from(sleepLogs)
      totalCount = Number(countResult[0]?.value || 0)
    }

    return { data, total: totalCount }
  }

  const getSleepLogById = async (id: number): Promise<SleepLog | undefined> => {
    const result = await db.select().from(sleepLogs).where(eq(sleepLogs.id, id)).limit(1)
    return result[0]
  }

  const getSleepLogsByUserId = async (userId: number, filter?: SleepLogFilterDto): Promise<{ data: SleepLog[]; total: number }> => {
    const { startDate, endDate, limit = 10, offset = 0 } = filter || {}

    // 조건 생성
    const whereConditions: SQL<unknown>[] = [sql`${sleepLogs.userId} = ${userId}`]

    if (startDate && endDate) {
      whereConditions.push(
        sql`${sleepLogs.sleepTime} >= ${startDate} AND ${sleepLogs.wakeTime} <= ${endDate}`
      );
    } else if (startDate) {
      whereConditions.push(sql`${sleepLogs.sleepTime} >= ${startDate}`)
    } else if (endDate) {
      whereConditions.push(sql`${sleepLogs.wakeTime} <= ${endDate}`)
    }

    // 데이터 조회
    const data = await db.select().from(sleepLogs)
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      .limit(limit)
      .offset(offset)

    // 전체 개수 조회
    const countResult = await db.select({ value: count() }).from(sleepLogs)
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
    const totalCount = Number(countResult[0]?.value || 0)

    return { data, total: totalCount }
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
