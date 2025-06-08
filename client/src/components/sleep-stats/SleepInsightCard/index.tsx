import React from 'react'
import { SleepInsight } from '../../../types/sleep-stats'

interface SleepInsightCardProps {
  insight: SleepInsight
}

const SleepInsightCard: React.FC<SleepInsightCardProps> = ({ insight }) => {
  // 인사이트 타입에 따른 배경색 및 아이콘 설정
  const getTypeStyles = () => {
    switch (insight.type) {
      case 'trend':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )
        }
      case 'anomaly':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'recommendation':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const { bgColor, textColor, borderColor, icon } = getTypeStyles()

  // 변화량에 따른 화살표 아이콘 및 색상
  const renderChangeIndicator = () => {
    if (!insight.data.change || insight.data.change === 0) return null

    const isPositive = insight.data.change > 0
    const absChange = Math.abs(insight.data.change)

    return (
      <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span className="ml-1">{absChange}%</span>
      </div>
    )
  }

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-medium ${textColor}`}>
              {insight.type === 'trend' && '추세'}
              {insight.type === 'anomaly' && '특이사항'}
              {insight.type === 'recommendation' && '추천사항'}
            </h4>
            {renderChangeIndicator()}
          </div>
          <p className="text-gray-700 mt-1">{insight.message}</p>
          {insight.data.metric && insight.data.value !== undefined && (
            <div className="mt-2 text-sm text-gray-500">
              {insight.data.metric}: {insight.data.value}
              {insight.data.metric === '수면 시간' && '분'}
              {insight.data.metric === '수면 품질' && '/10'}
              {insight.data.metric === '수면 일관성' && '%'}
              {insight.data.metric === '수면 효율성' && '%'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SleepInsightCard