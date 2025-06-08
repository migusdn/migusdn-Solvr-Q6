import React, { useState, useEffect } from 'react';
import { SleepLog, SleepLogFilters } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';

interface SleepLogListProps {
  onSelectLog: (log: SleepLog) => void;
  filters?: SleepLogFilters;
}

export const SleepLogList: React.FC<SleepLogListProps> = ({ onSelectLog, filters }) => {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 10;

  const fetchLogs = async (pageNum: number) => {
    try {
      setLoading(true);
      const pageFilters = {
        ...filters,
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE,
      };
      
      const data = await sleepLogService.getAll(pageFilters);
      
      if (pageNum === 0) {
        setLogs(data);
      } else {
        setLogs(prevLogs => [...prevLogs, ...data]);
      }
      
      setHasMore(data.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError('수면 기록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch sleep logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchLogs(0);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLogs(nextPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'bg-green-100 text-green-800';
    if (quality >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">수면 기록 목록</h2>
      
      {logs.length === 0 && !loading ? (
        <div className="text-gray-500 p-4">기록된 수면 데이터가 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li 
              key={log.id} 
              className="py-4 px-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectLog(log)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatDate(log.sleepTime)}</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(log.sleepTime)} - {formatTime(log.wakeTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    수면 시간: {formatDuration(log.sleepDuration)}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(log.quality)}`}>
                  {log.quality}/10
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center p-4">
          <button 
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default SleepLogList;