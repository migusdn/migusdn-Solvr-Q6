import React from 'react'
import { SleepTrendPoint } from '../../../types/sleep-stats'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface SleepDurationChartProps {
  data: SleepTrendPoint[]
}

const SleepDurationChart: React.FC<SleepDurationChartProps> = ({ data }) => {
  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center">
        <p className="text-gray-500">수면 시간 데이터가 없습니다.</p>
      </div>
    )
  }

  // 시간 포맷팅 함수
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분`
  }

  // 차트 데이터 포맷팅
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    minutes: item.value,
    hours: Math.floor(item.value / 60) + (item.value % 60) / 60,
    originalDate: item.date
  }))

  // 평균 수면 시간 계산
  const averageDuration = data.reduce((sum, item) => sum + item.value, 0) / data.length

  // 툴팁 커스터마이징
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{label}</p>
          <p className="text-blue-500">
            {formatDuration(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Y축 틱 포맷팅
  const formatYAxis = (minutes: number) => {
    return `${Math.floor(minutes / 60)}시간`
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">수면 시간 추이</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.max(0, Math.floor(data.length / 7))}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="minutes" 
              name="수면 시간" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>평균 수면 시간: {formatDuration(averageDuration)}</p>
      </div>
    </div>
  )
}

export default SleepDurationChart
