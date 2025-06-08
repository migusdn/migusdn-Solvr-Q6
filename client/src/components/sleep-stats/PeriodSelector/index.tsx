import React from 'react'

interface PeriodSelectorProps {
  period: string
  onPeriodChange: (period: string) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onResetDates: () => void
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onResetDates
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">통계 설정</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">기간 단위</label>
        <div className="flex flex-wrap gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-2 rounded-md ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              {p === 'daily' && '일별'}
              {p === 'weekly' && '주별'}
              {p === 'monthly' && '월별'}
              {p === 'yearly' && '연별'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            시작일
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            종료일
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onResetDates}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}

export default PeriodSelector