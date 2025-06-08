import React, { useState } from 'react';
import { SleepLog } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';

interface SleepLogDetailProps {
  log: SleepLog;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const SleepLogDetail: React.FC<SleepLogDetailProps> = ({ 
  log, 
  onEdit, 
  onDelete, 
  onClose 
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 8) return '좋음';
    if (quality >= 5) return '보통';
    return '나쁨';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'bg-green-100 text-green-800';
    if (quality >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await sleepLogService.delete(log.id);
      onDelete();
    } catch (err) {
      setError('수면 기록 삭제에 실패했습니다.');
      console.error('Failed to delete sleep log:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">수면 기록 상세</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 sm:p-2 rounded-full hover:bg-gray-100"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">날짜</h3>
          <p className="mt-1 text-sm sm:text-base">{formatDate(log.sleepTime)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">취침 시간</h3>
            <p className="mt-1 text-sm sm:text-base">{formatTime(log.sleepTime)}</p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">기상 시간</h3>
            <p className="mt-1 text-sm sm:text-base">{formatTime(log.wakeTime)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">수면 시간</h3>
          <p className="mt-1 text-sm sm:text-base">{formatDuration(log.sleepDuration)}</p>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">수면 품질</h3>
          <div className="mt-1 flex items-center">
            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getQualityColor(log.quality)}`}>
              {log.quality}/10 - {getQualityLabel(log.quality)}
            </span>
          </div>
        </div>

        {log.notes && (
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">메모</h3>
            <p className="mt-1 text-sm sm:text-base text-gray-900 whitespace-pre-line">{log.notes}</p>
          </div>
        )}

        <div className="pt-3 sm:pt-4 border-t border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">기록 정보</h3>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
            <p>생성: {new Date(log.createdAt).toLocaleString('ko-KR')}</p>
            <p>수정: {new Date(log.updatedAt).toLocaleString('ko-KR')}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={onEdit}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
          aria-label="수면 기록 수정"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
          aria-label="수면 기록 삭제"
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
};

export default SleepLogDetail;
