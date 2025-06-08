import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { sleepStatsService } from '../../../services/api'
import { SleepStatsResponse, SleepInsight, SleepStatsFilters, PeriodStat } from '../../../types/sleep-stats'
import PeriodSelector from '../PeriodSelector'
import SleepDurationChart from '../SleepDurationChart'
import SleepQualityChart from '../SleepQualityChart'
import SleepPatternChart from '../SleepPatternChart'
import SleepInsightCard from '../SleepInsightCard'
import SleepAIAnalysisCard from '../SleepAIAnalysisCard'

const SleepStatsDashboard: React.FC = () => {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [summaryData, setSummaryData] = useState<SleepStatsResponse | null>(null)
  const [periodStats, setPeriodStats] = useState<PeriodStat[]>([])
  const [insights, setInsights] = useState<SleepInsight[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 기본 날짜 범위 설정 (최근 30일)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  // 데이터 로드 함수
  const loadData = async () => {
    if (!user) {
      setError('사용자 인증이 필요합니다.')
      setLoading(false)
      return
    }

    if (!startDate || !endDate) {
      return // 날짜가 설정되지 않은 경우 API 호출 건너뛰기
    }

    setLoading(true)
    setError(null)

    try {
      // 필터 설정
      const filters: SleepStatsFilters = {
        userId: user.id,
        startDate,
        endDate
      }

      // 1. 종합 통계 데이터 로드
      const summary = await sleepStatsService.getSummary(filters)
      setSummaryData(summary)

      // 2. 기간별 통계 데이터 로드
      const periodFilters = { ...filters, period }
      const periodData = await sleepStatsService.getPeriodStats(periodFilters)
      setPeriodStats(periodData)

      // 3. 인사이트 데이터 로드
      const insightData = await sleepStatsService.getInsights(user.id)
      setInsights(insightData)
    } catch (err) {
      console.error('Failed to load sleep stats:', err)
      setError('수면 통계 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 날짜 또는 기간이 변경될 때 데이터 다시 로드
  useEffect(() => {
    loadData()
  }, [user, startDate, endDate, period])

  // 날짜 초기화 핸들러
  const handleResetDates = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
  }

  // 로딩 상태 표시
  if (loading && !summaryData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">오류가 발생했습니다</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 기간 선택기 */}
      <PeriodSelector
        period={period}
        onPeriodChange={setPeriod}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onResetDates={handleResetDates}
      />

      {/* 요약 통계 */}
      {summaryData && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3">수면 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">총 기록</p>
              <p className="text-xl font-bold">{summaryData.summary.totalLogs}회</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-700 font-medium">평균 수면시간</p>
              <p className="text-xl font-bold">
                {Math.floor(summaryData.summary.averageDuration / 60)}시간 {summaryData.summary.averageDuration % 60}분
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-700 font-medium">평균 품질</p>
              <p className="text-xl font-bold">{summaryData.summary.averageQuality}/10</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-700 font-medium">평균 취침</p>
              <p className="text-xl font-bold">{summaryData.summary.averageBedtime}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-xs text-indigo-700 font-medium">평균 기상</p>
              <p className="text-xl font-bold">{summaryData.summary.averageWakeTime}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-700 font-medium">수면 효율</p>
              <p className="text-xl font-bold">{summaryData.summary.sleepEfficiency}%</p>
            </div>
          </div>
        </div>
      )}

      {/* AI 수면 분석 카드 */}
      {summaryData && summaryData.summary.totalLogs > 0 && (
        <div className="mt-6">
          <SleepAIAnalysisCard />
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 수면 시간 차트 */}
        {summaryData && (
          <SleepDurationChart data={summaryData.trends.duration} />
        )}

        {/* 수면 품질 차트 */}
        {summaryData && (
          <SleepQualityChart data={summaryData.trends.quality} />
        )}
      </div>

      {/* 수면 패턴 차트 */}
      {summaryData && (
        <SleepPatternChart data={summaryData.patterns} />
      )}

      {/* 기간별 통계 */}
      {periodStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3">
            {period === 'daily' && '일별 통계'}
            {period === 'weekly' && '주별 통계'}
            {period === 'monthly' && '월별 통계'}
            {period === 'yearly' && '연별 통계'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 수면시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 품질</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기록 수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periodStats.map((stat, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(stat.avgDuration / 60)}시간 {stat.avgDuration % 60}분
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.avgQuality}/10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.logsCount}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 인사이트 섹션 */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3">수면 인사이트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <SleepInsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* 데이터가 없는 경우 */}
      {!loading && !error && (!summaryData || (summaryData.summary.totalLogs === 0)) && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">수면 데이터가 없습니다</h3>
          <p className="mt-2 text-gray-500">
            선택한 기간에 기록된 수면 데이터가 없습니다. 다른 기간을 선택하거나 수면 기록을 추가해주세요.
          </p>
        </div>
      )}
    </div>
  )
}

export default SleepStatsDashboard
