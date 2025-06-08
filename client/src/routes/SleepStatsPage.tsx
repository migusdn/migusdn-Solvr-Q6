import React from 'react'
import { Link } from 'react-router-dom'
import SleepStatsDashboard from '../components/sleep-stats/SleepStatsDashboard'

const SleepStatsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">수면 통계</h1>
        <Link 
          to="/sleep-tracker" 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          트래커로 돌아가기
        </Link>
      </div>
      <SleepStatsDashboard />
    </div>
  )
}

export default SleepStatsPage
