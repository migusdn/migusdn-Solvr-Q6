// server/src/services/sleepStatsService.ts
import { eq, and, gte, lte, sql, count, avg, max, min } from 'drizzle-orm'
import { sleepLogs } from '../db/schema'
import { Database } from '../types/database'
import { SQL } from 'drizzle-orm/sql'

// 수면 통계 서비스 의존성 타입
type SleepStatsServiceDeps = {
  db: Database
}

// 수면 통계 요약 인터페이스
export interface SleepSummary {
  totalLogs: number
  averageDuration: number
  averageQuality: number
  averageBedtime: string
  averageWakeTime: string
  sleepEfficiency: number
}

// 수면 추세 포인트 인터페이스
export interface SleepTrendPoint {
  date: string
  value: number
}

// 수면 추세 인터페이스
export interface SleepTrends {
  duration: SleepTrendPoint[]
  quality: SleepTrendPoint[]
}

// 수면 패턴 인터페이스
export interface SleepPatterns {
  weekdayAvgDuration: number
  weekendAvgDuration: number
  consistencyScore: number
}

// 수면 통계 응답 인터페이스
export interface SleepStatsResponse {
  summary: SleepSummary
  trends: SleepTrends
  patterns: SleepPatterns
}

// 기간별 통계 인터페이스
export interface PeriodStat {
  period: string
  avgDuration: number
  avgQuality: number
  logsCount: number
}

// 수면 인사이트 인터페이스
export interface SleepInsight {
  type: 'trend' | 'anomaly' | 'recommendation'
  message: string
  data: {
    metric: string
    value: number
    change: number
    period: string
  }
}

// 시간 문자열을 분으로 변환하는 함수 (HH:MM 형식)
const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

// 분을 시간 문자열로 변환하는 함수 (HH:MM 형식)
const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// 날짜에서 요일을 확인하는 함수 (0: 일요일, 6: 토요일)
const getDayOfWeek = (dateString: string): number => {
  return new Date(dateString).getDay()
}

// 주말 여부를 확인하는 함수
const isWeekend = (dateString: string): boolean => {
  const day = getDayOfWeek(dateString)
  return day === 0 || day === 6 // 토요일 또는 일요일
}

// 일관성 점수 계산 함수 (표준편차 기반)
const calculateConsistencyScore = (values: number[]): number => {
  if (values.length <= 1) return 100 // 데이터가 1개 이하면 완벽한 일관성

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(variance)

  // 표준편차를 0-100 점수로 변환 (낮을수록 일관성 높음)
  // 최대 표준편차를 120분(2시간)으로 가정
  const maxStdDev = 120
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / maxStdDev) * 100))
  return Math.round(consistencyScore)
}

export const createSleepStatsService = ({ db }: SleepStatsServiceDeps) => {
  // 종합 수면 통계 조회
  const getSummary = async (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<SleepStatsResponse> => {
    // 기본 조건: 사용자 ID로 필터링
    const whereConditions: SQL<unknown>[] = [sql`${sleepLogs.userId} = ${userId}`]

    // 날짜 범위 조건 추가
    if (startDate) {
      whereConditions.push(sql`${sleepLogs.sleepTime} >= ${startDate}`)
    }
    if (endDate) {
      whereConditions.push(sql`${sleepLogs.wakeTime} <= ${endDate}`)
    }

    // 해당 기간의 모든 수면 기록 조회
    const sleepLogData = await db
      .select()
      .from(sleepLogs)
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))

    // 기록이 없는 경우 기본값 반환
    if (sleepLogData.length === 0) {
      return {
        summary: {
          totalLogs: 0,
          averageDuration: 0,
          averageQuality: 0,
          averageBedtime: '00:00',
          averageWakeTime: '00:00',
          sleepEfficiency: 0
        },
        trends: {
          duration: [],
          quality: []
        },
        patterns: {
          weekdayAvgDuration: 0,
          weekendAvgDuration: 0,
          consistencyScore: 0
        }
      }
    }

    // 총 기록 수
    const totalLogs = sleepLogData.length

    // 평균 수면 시간 (분)
    const averageDuration =
      sleepLogData.reduce((sum, log) => sum + log.sleepDuration, 0) / totalLogs

    // 평균 수면 품질
    const qualityLogs = sleepLogData.filter(log => log.quality !== null && log.quality !== undefined)
    const averageQuality =
      qualityLogs.length > 0
        ? qualityLogs.reduce((sum, log) => sum + (log.quality || 0), 0) / qualityLogs.length
        : 0

    // 평균 취침 시간 및 기상 시간 계산
    const bedtimeMinutes: number[] = []
    const waketimeMinutes: number[] = []

    sleepLogData.forEach(log => {
      const sleepDate = new Date(log.sleepTime)
      const wakeDate = new Date(log.wakeTime)

      // 취침 시간을 분으로 변환 (자정 기준)
      const sleepHours = sleepDate.getHours()
      const sleepMins = sleepDate.getMinutes()
      // 오후 9시부터 다음날 오전 9시까지를 하루의 취침 시간으로 간주
      const bedtimeInMinutes =
        sleepHours < 9 ? sleepHours * 60 + sleepMins + 24 * 60 : sleepHours * 60 + sleepMins

      // 기상 시간을 분으로 변환
      const wakeHours = wakeDate.getHours()
      const wakeMins = wakeDate.getMinutes()
      const waketimeInMinutes = wakeHours * 60 + wakeMins

      bedtimeMinutes.push(bedtimeInMinutes)
      waketimeMinutes.push(waketimeInMinutes)
    })

    // 평균 취침 시간 계산 (분)
    const avgBedtimeMinutes =
      bedtimeMinutes.reduce((sum, minutes) => sum + minutes, 0) / bedtimeMinutes.length
    // 24시간 형식으로 변환 (자정 넘어가는 경우 처리)
    const normalizedAvgBedtimeMinutes = avgBedtimeMinutes % (24 * 60)
    const averageBedtime = minutesToTimeString(normalizedAvgBedtimeMinutes)

    // 평균 기상 시간 계산 (분)
    const avgWaketimeMinutes =
      waketimeMinutes.reduce((sum, minutes) => sum + minutes, 0) / waketimeMinutes.length
    const averageWakeTime = minutesToTimeString(avgWaketimeMinutes)

    // 수면 효율성 계산 (이상적인 수면 시간 대비 실제 수면 시간의 비율)
    // 이상적인 수면 시간을 8시간(480분)으로 가정
    const idealSleepDuration = 480
    const sleepEfficiency = Math.min(100, (averageDuration / idealSleepDuration) * 100)

    // 추세 데이터 생성
    const trends: SleepTrends = {
      duration: sleepLogData.map(log => ({
        date: log.sleepTime.split('T')[0], // YYYY-MM-DD 형식으로 변환
        value: log.sleepDuration
      })),
      quality: qualityLogs.map(log => ({
        date: log.sleepTime.split('T')[0], // YYYY-MM-DD 형식으로 변환
        value: log.quality || 0
      }))
    }

    // 날짜순으로 정렬
    trends.duration.sort((a, b) => a.date.localeCompare(b.date))
    trends.quality.sort((a, b) => a.date.localeCompare(b.date))

    // 평일/주말 패턴 분석
    const weekdayLogs = sleepLogData.filter(log => !isWeekend(log.sleepTime))
    const weekendLogs = sleepLogData.filter(log => isWeekend(log.sleepTime))

    const weekdayAvgDuration =
      weekdayLogs.length > 0
        ? weekdayLogs.reduce((sum, log) => sum + log.sleepDuration, 0) / weekdayLogs.length
        : 0
    const weekendAvgDuration =
      weekendLogs.length > 0
        ? weekendLogs.reduce((sum, log) => sum + log.sleepDuration, 0) / weekendLogs.length
        : 0

    // 일관성 점수 계산 (취침 시간 기준)
    const consistencyScore = calculateConsistencyScore(bedtimeMinutes)

    return {
      summary: {
        totalLogs,
        averageDuration: Math.round(averageDuration),
        averageQuality: Number(averageQuality.toFixed(1)),
        averageBedtime,
        averageWakeTime,
        sleepEfficiency: Math.round(sleepEfficiency)
      },
      trends,
      patterns: {
        weekdayAvgDuration: Math.round(weekdayAvgDuration),
        weekendAvgDuration: Math.round(weekendAvgDuration),
        consistencyScore
      }
    }
  }

  // 기간별 수면 통계 조회
  const getPeriodStats = async (
    userId: number,
    period: string,
    startDate: string,
    endDate: string
  ): Promise<PeriodStat[]> => {
    // 기본 조건: 사용자 ID로 필터링
    const whereConditions: SQL<unknown>[] = [sql`${sleepLogs.userId} = ${userId}`]

    // 날짜 범위 조건 추가
    if (startDate) {
      whereConditions.push(sql`${sleepLogs.sleepTime} >= ${startDate}`)
    }
    if (endDate) {
      whereConditions.push(sql`${sleepLogs.wakeTime} <= ${endDate}`)
    }

    // 해당 기간의 모든 수면 기록 조회
    const sleepLogData = await db
      .select()
      .from(sleepLogs)
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))

    // 기록이 없는 경우 빈 배열 반환
    if (sleepLogData.length === 0) {
      return []
    }

    // 기간별로 데이터 그룹화
    const groupedData: Record<string, { durations: number[]; qualities: number[]; count: number }> =
      {}

    sleepLogData.forEach(log => {
      const date = new Date(log.sleepTime)
      let periodKey: string

      switch (period) {
        case 'daily':
          // 일별: YYYY-MM-DD
          periodKey = log.sleepTime.split('T')[0]
          break
        case 'weekly':
          // 주별: YYYY-WW (연도-주차)
          const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
          periodKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`
          break
        case 'monthly':
          // 월별: YYYY-MM
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'yearly':
          // 연별: YYYY
          periodKey = date.getFullYear().toString()
          break
        default:
          // 기본값은 일별
          periodKey = log.sleepTime.split('T')[0]
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { durations: [], qualities: [], count: 0 }
      }

      groupedData[periodKey].durations.push(log.sleepDuration)
      if (log.quality !== null && log.quality !== undefined) {
        groupedData[periodKey].qualities.push(log.quality)
      }
      groupedData[periodKey].count++
    })

    // 그룹화된 데이터를 배열로 변환
    const periodStats: PeriodStat[] = Object.entries(groupedData).map(([period, data]) => ({
      period,
      avgDuration:
        data.durations.length > 0
          ? Math.round(data.durations.reduce((sum, val) => sum + val, 0) / data.durations.length)
          : 0,
      avgQuality:
        data.qualities.length > 0
          ? Number(
              (data.qualities.reduce((sum, val) => sum + val, 0) / data.qualities.length).toFixed(1)
            )
          : 0,
      logsCount: data.count
    }))

    // 기간 순으로 정렬
    periodStats.sort((a, b) => a.period.localeCompare(b.period))

    return periodStats
  }

  // 수면 인사이트 조회
  const getInsights = async (userId: number): Promise<SleepInsight[]> => {
    const insights: SleepInsight[] = []

    // 최근 30일 데이터 조회
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    // 최근 30일 통계 조회
    const recentStats = await getSummary(userId, startDate, endDate)

    // 이전 30일 데이터 조회 (비교용)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const prevStartDate = sixtyDaysAgo.toISOString().split('T')[0]
    const prevEndDate = thirtyDaysAgo.toISOString().split('T')[0]

    // 이전 30일 통계 조회
    const prevStats = await getSummary(userId, prevStartDate, prevEndDate)

    // 데이터가 충분한 경우에만 인사이트 생성
    if (recentStats.summary.totalLogs > 0) {
      // 1. 수면 시간 추세 인사이트
      if (prevStats.summary.totalLogs > 0) {
        const durationChange =
          recentStats.summary.averageDuration - prevStats.summary.averageDuration
        const durationChangePercent = Math.round(
          (durationChange / prevStats.summary.averageDuration) * 100
        )

        if (Math.abs(durationChangePercent) >= 10) {
          insights.push({
            type: 'trend',
            message:
              durationChange > 0
                ? `최근 30일간 수면 시간이 이전 30일 대비 ${durationChangePercent}% 증가했습니다.`
                : `최근 30일간 수면 시간이 이전 30일 대비 ${Math.abs(
                    durationChangePercent
                  )}% 감소했습니다.`,
            data: {
              metric: '수면 시간',
              value: recentStats.summary.averageDuration,
              change: durationChangePercent,
              period: '30일'
            }
          })
        }
      }

      // 2. 수면 품질 인사이트
      if (recentStats.summary.averageQuality > 0 && prevStats.summary.averageQuality > 0) {
        const qualityChange =
          recentStats.summary.averageQuality - prevStats.summary.averageQuality
        const qualityChangePercent = Math.round(
          (qualityChange / prevStats.summary.averageQuality) * 100
        )

        if (Math.abs(qualityChangePercent) >= 10) {
          insights.push({
            type: 'trend',
            message:
              qualityChange > 0
                ? `최근 30일간 수면 품질이 이전 30일 대비 ${qualityChangePercent}% 향상되었습니다.`
                : `최근 30일간 수면 품질이 이전 30일 대비 ${Math.abs(
                    qualityChangePercent
                  )}% 저하되었습니다.`,
            data: {
              metric: '수면 품질',
              value: recentStats.summary.averageQuality,
              change: qualityChangePercent,
              period: '30일'
            }
          })
        }
      }

      // 3. 수면 패턴 인사이트 (평일 vs 주말)
      const weekdayWeekendDiff =
        recentStats.patterns.weekendAvgDuration - recentStats.patterns.weekdayAvgDuration
      if (Math.abs(weekdayWeekendDiff) >= 60) {
        // 1시간 이상 차이가 나는 경우
        insights.push({
          type: 'anomaly',
          message:
            weekdayWeekendDiff > 0
              ? `주말에 평일보다 평균 ${Math.round(
                  weekdayWeekendDiff / 60
                )}시간 더 많이 주무시는 경향이 있습니다.`
              : `평일에 주말보다 평균 ${Math.round(
                  Math.abs(weekdayWeekendDiff) / 60
                )}시간 더 많이 주무시는 특이한 패턴을 보입니다.`,
          data: {
            metric: '평일/주말 수면시간 차이',
            value: Math.abs(weekdayWeekendDiff),
            change: 0,
            period: '30일'
          }
        })
      }

      // 4. 수면 일관성 인사이트
      if (recentStats.patterns.consistencyScore < 50) {
        insights.push({
          type: 'recommendation',
          message: `수면 일관성 점수가 낮습니다 (${recentStats.patterns.consistencyScore}/100). 매일 비슷한 시간에 취침하고 기상하는 것이 수면 품질 향상에 도움이 됩니다.`,
          data: {
            metric: '수면 일관성',
            value: recentStats.patterns.consistencyScore,
            change: 0,
            period: '30일'
          }
        })
      } else if (recentStats.patterns.consistencyScore >= 80) {
        insights.push({
          type: 'trend',
          message: `수면 일관성이 매우 좋습니다 (${recentStats.patterns.consistencyScore}/100). 규칙적인 수면 습관을 잘 유지하고 계십니다.`,
          data: {
            metric: '수면 일관성',
            value: recentStats.patterns.consistencyScore,
            change: 0,
            period: '30일'
          }
        })
      }

      // 5. 수면 효율성 인사이트
      if (recentStats.summary.sleepEfficiency < 60) {
        insights.push({
          type: 'recommendation',
          message: `수면 효율성이 낮습니다 (${recentStats.summary.sleepEfficiency}%). 이상적인 수면 시간(8시간)에 비해 수면이 부족합니다.`,
          data: {
            metric: '수면 효율성',
            value: recentStats.summary.sleepEfficiency,
            change: 0,
            period: '30일'
          }
        })
      } else if (recentStats.summary.sleepEfficiency > 100) {
        insights.push({
          type: 'recommendation',
          message: `수면 시간이 8시간을 초과합니다. 너무 많은 수면도 건강에 좋지 않을 수 있습니다.`,
          data: {
            metric: '수면 효율성',
            value: recentStats.summary.sleepEfficiency,
            change: 0,
            period: '30일'
          }
        })
      }
    } else {
      // 데이터가 부족한 경우
      insights.push({
        type: 'recommendation',
        message: '더 정확한 수면 인사이트를 위해 꾸준히 수면 기록을 입력해주세요.',
        data: {
          metric: '데이터 부족',
          value: 0,
          change: 0,
          period: '30일'
        }
      })
    }

    return insights
  }

  return {
    getSummary,
    getPeriodStats,
    getInsights
  }
}

export type SleepStatsService = ReturnType<typeof createSleepStatsService>