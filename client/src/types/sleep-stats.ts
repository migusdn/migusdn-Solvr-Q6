// client/src/types/sleep-stats.ts

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

// 수면 통계 필터 인터페이스
export interface SleepStatsFilters {
  userId?: number
  startDate?: string
  endDate?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}