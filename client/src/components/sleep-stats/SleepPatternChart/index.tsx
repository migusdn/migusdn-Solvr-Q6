import React from 'react'
import { SleepPatterns } from '../../../types/sleep-stats'

interface SleepPatternChartProps {
  data: SleepPatterns
}

const SleepPatternChart: React.FC<SleepPatternChartProps> = ({ data }) => {
  // 데이터가 없는 경우 처리
  if (!data || (!data.weekdayAvgDuration && !data.weekendAvgDuration && !data.consistencyScore)) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
        <p className="text-gray-500">수면 패턴 데이터가 없습니다.</p>
      </div>
    )
  }

  // 시간 포맷팅 함수
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분`
  }

  // 일관성 점수에 따른 색상 및 메시지
  const getConsistencyColor = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', message: '매우 좋음' }
    if (score >= 60) return { color: 'text-blue-600', bg: 'bg-blue-100', message: '좋음' }
    if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-100', message: '보통' }
    return { color: 'text-red-600', bg: 'bg-red-100', message: '개선 필요' }
  }

  const consistencyStyle = getConsistencyColor(data.consistencyScore)

  // 평일/주말 수면 시간 차이 계산
  const weekdayWeekendDiff = data.weekendAvgDuration - data.weekdayAvgDuration
  const diffText = weekdayWeekendDiff > 0 
    ? `주말에 ${formatDuration(Math.abs(weekdayWeekendDiff))} 더 많이 잠`
    : weekdayWeekendDiff < 0
      ? `평일에 ${formatDuration(Math.abs(weekdayWeekendDiff))} 더 많이 잠`
      : '평일과 주말 수면시간 동일'

  // 막대 그래프 최대 높이 (픽셀)
  const maxBarHeight = 150
  // 최대 수면 시간 (분)
  const maxDuration = Math.max(data.weekdayAvgDuration, data.weekendAvgDuration)
  
  // 막대 높이 계산
  const weekdayHeight = (data.weekdayAvgDuration / maxDuration) * maxBarHeight
  const weekendHeight = (data.weekendAvgDuration / maxDuration) * maxBarHeight

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">수면 패턴 분석</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 평일/주말 수면 시간 비교 */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 text-gray-700">평일 vs 주말 수면 시간</h4>
          
          <div className="flex justify-center items-end h-48 gap-10 mb-4">
            <div className="flex flex-col items-center">
              <div 
                className="w-16 bg-blue-500 rounded-t"
                style={{ height: `${weekdayHeight}px` }}
              ></div>
              <p className="mt-2 text-sm font-medium">평일</p>
              <p className="text-xs text-gray-500">{formatDuration(data.weekdayAvgDuration)}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                className="w-16 bg-purple-500 rounded-t"
                style={{ height: `${weekendHeight}px` }}
              ></div>
              <p className="mt-2 text-sm font-medium">주말</p>
              <p className="text-xs text-gray-500">{formatDuration(data.weekendAvgDuration)}</p>
            </div>
          </div>
          
          <p className="text-sm text-center text-gray-600">{diffText}</p>
        </div>
        
        {/* 수면 일관성 점수 */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 text-gray-700">수면 일관성 점수</h4>
          
          <div className="flex flex-col items-center justify-center h-48">
            <div className={`w-32 h-32 rounded-full ${consistencyStyle.bg} flex items-center justify-center`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${consistencyStyle.color}`}>{data.consistencyScore}</p>
                <p className="text-xs text-gray-500">/100</p>
              </div>
            </div>
            
            <p className={`mt-4 font-medium ${consistencyStyle.color}`}>{consistencyStyle.message}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="text-center">
          수면 일관성은 매일 비슷한 시간에 취침하고 기상하는 정도를 나타냅니다.
          높은 일관성은 더 나은 수면 품질과 관련이 있습니다.
        </p>
      </div>
    </div>
  )
}

export default SleepPatternChart