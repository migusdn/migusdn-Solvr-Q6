import React from 'react'
import { SleepTrendPoint } from '../../../types/sleep-stats'

interface SleepQualityChartProps {
  data: SleepTrendPoint[]
}

const SleepQualityChart: React.FC<SleepQualityChartProps> = ({ data }) => {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
        <p className="text-gray-500">수면 품질 데이터가 없습니다.</p>
      </div>
    )
  }

  // 차트 라이브러리가 없으므로 간단한 시각화로 대체
  // 실제 구현에서는 recharts 등의 라이브러리를 사용해야 함
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  
  // 품질 점수에 따른 색상 결정
  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'bg-green-500'
    if (quality >= 6) return 'bg-blue-500'
    if (quality >= 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">수면 품질 추이</h3>
      
      <div className="h-64 relative">
        {/* 간단한 막대 그래프 구현 */}
        <div className="flex h-full items-end space-x-1">
          {data.map((item, index) => {
            // 막대 높이 계산 (최대값 기준 상대적 높이, 최소 10%)
            const heightPercent = ((item.value - minValue) / (maxValue - minValue || 1)) * 80 + 10
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${getQualityColor(item.value)} rounded-t`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${item.date}: ${item.value}/10`}
                ></div>
                {/* 날짜 레이블 (모든 날짜를 표시하면 복잡해지므로 일부만 표시) */}
                {index % Math.max(1, Math.floor(data.length / 7)) === 0 && (
                  <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}/10</span>
          <span>{Math.floor((maxValue + minValue) / 2)}/10</span>
          <span>{minValue}/10</span>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>평균 수면 품질: {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}/10</p>
      </div>
      
      {/* 범례 */}
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-1"></div>
          <span>좋음 (8-10)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 mr-1"></div>
          <span>보통 (6-7)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 mr-1"></div>
          <span>나쁨 (4-5)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1"></div>
          <span>매우 나쁨 (1-3)</span>
        </div>
      </div>
    </div>
  )
}

export default SleepQualityChart