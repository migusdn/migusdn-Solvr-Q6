import React, { useState, useEffect } from 'react';
import { SleepAIAnalysis } from '../../../types/sleep-stats';
import { sleepStatsService } from '../../../services/api';

const SleepAIAnalysisCard: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<SleepAIAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // AI 분석 데이터 가져오기
  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      const data = await sleepStatsService.getAIAnalysis();
      setAnalysisData(data);
      setError(null);
    } catch (err) {
      console.error('AI 분석 데이터 요청 실패:', err);
      setError('AI 분석 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 분석 데이터 새로고침
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const data = await sleepStatsService.refreshAIAnalysis();
      setAnalysisData(data);
      setError(null);
    } catch (err) {
      console.error('AI 분석 데이터 새로고침 실패:', err);
      setError('AI 분석 데이터를 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  // 인사이트 유형별 색상 클래스
  const getInsightColorClass = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'improvement':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // 권장사항 우선순위별 색상 클래스
  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // 로딩 상태 표시
  if (loading && !analysisData) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI 수면 분석</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error && !analysisData) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI 수면 분석</h3>
          <button
            onClick={fetchAIAnalysis}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            다시 시도
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">오류가 발생했습니다</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!analysisData) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI 수면 분석</h3>
          <button
            onClick={fetchAIAnalysis}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            분석 요청
          </button>
        </div>
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">AI 분석 데이터가 없습니다</h3>
          <p className="mt-2 text-gray-500">
            AI 분석을 요청하여 수면 패턴에 대한 인사이트를 얻어보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">AI 수면 분석</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {new Date(analysisData.generatedAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} 생성
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-3 py-1 rounded-md transition-colors ${
              refreshing
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {refreshing ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 수면 패턴 요약 */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">수면 패턴 요약</h4>
        <p className="text-gray-700">{analysisData.sleepPattern.summary}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">평균 수면시간</p>
            <p className="text-xl font-bold">
              {Math.floor(analysisData.sleepPattern.averageDuration / 60)}시간 {analysisData.sleepPattern.averageDuration % 60}분
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-700 font-medium">수면 품질</p>
            <p className="text-xl font-bold">{analysisData.sleepPattern.qualityScore}/100</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="text-xs text-indigo-700 font-medium">수면 일관성</p>
            <p className="text-xl font-bold">{analysisData.sleepPattern.consistency}/100</p>
          </div>
        </div>
      </div>

      {/* 인사이트 */}
      {analysisData.insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">주요 인사이트</h4>
          <div className="space-y-3">
            {analysisData.insights.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getInsightColorClass(insight.type)}`}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{insight.title}</h5>
                  <span className="text-xs px-2 py-1 rounded-full bg-white">
                    {insight.type === 'strength' && '강점'}
                    {insight.type === 'improvement' && '개선점'}
                    {insight.type === 'warning' && '주의'}
                  </span>
                </div>
                <p className="text-sm mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 권장사항 */}
      {analysisData.recommendations.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">개인화된 권장사항</h4>
          <div className="space-y-3">
            {analysisData.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getPriorityColorClass(recommendation.priority)}`}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{recommendation.title}</h5>
                  <span className="text-xs px-2 py-1 rounded-full bg-white">
                    {recommendation.priority === 'high' && '높은 우선순위'}
                    {recommendation.priority === 'medium' && '중간 우선순위'}
                    {recommendation.priority === 'low' && '낮은 우선순위'}
                  </span>
                </div>
                <p className="text-sm mt-1">{recommendation.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepAIAnalysisCard;