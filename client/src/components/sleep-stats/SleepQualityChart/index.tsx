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
  Cell,
} from 'recharts'

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

  // 품질 점수에 따른 색상 결정
  const getQualityColor = (quality: number) => {
    if (quality >= 8) return '#22c55e' // green-500
    if (quality >= 6) return '#3b82f6' // blue-500
    if (quality >= 4) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  // 품질 등급 결정
  const getQualityLabel = (quality: number) => {
    if (quality >= 8) return '좋음'
    if (quality >= 6) return '보통'
    if (quality >= 4) return '나쁨'
    return '매우 나쁨'
  }

  // 차트 데이터 포맷팅
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    quality: item.value,
    color: getQualityColor(item.value),
    label: getQualityLabel(item.value),
    originalDate: item.date
  }))

  // 평균 수면 품질 계산
  const averageQuality = data.reduce((sum, item) => sum + item.value, 0) / data.length

  // 툴팁 커스터마이징
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{label}</p>
          <p style={{ color: data.color }}>
            품질: {data.quality}/10 ({data.label})
          </p>
        </div>
      )
    }
    return null
  }

  // 범례 아이템
  const qualityLevels = [
    { value: '좋음 (8-10)', color: '#22c55e' },
    { value: '보통 (6-7)', color: '#3b82f6' },
    { value: '나쁨 (4-5)', color: '#eab308' },
    { value: '매우 나쁨 (1-3)', color: '#ef4444' }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">수면 품질 추이</h3>

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
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="quality" 
              name="수면 품질" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>평균 수면 품질: {averageQuality.toFixed(1)}/10</p>
      </div>

      {/* 범례 */}
      <div className="mt-2 flex justify-center gap-4 text-xs">
        {qualityLevels.map((level, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 mr-1" style={{ backgroundColor: level.color }}></div>
            <span>{level.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SleepQualityChart
