import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SleepLog, SleepLogFilters } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';
import SwipeableListItem from '../SwipeableListItem';
import { useAuth } from '../../../hooks/useAuth';

interface SleepLogListProps {
  onSelectLog: (log: SleepLog) => void;
  filters?: SleepLogFilters;
  onEditLog?: (log: SleepLog) => void;
  onDeleteLog?: (log: SleepLog) => void;
}

export const SleepLogList: React.FC<SleepLogListProps> = ({ 
  onSelectLog, 
  filters,
  onEditLog,
  onDeleteLog 
}) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 10;

  // Reference for the observer
  const observer = useRef<IntersectionObserver | null>(null);

  // Reference for the last list item element
  const lastLogElementRef = useCallback((node: HTMLLIElement | null) => {
    if (loading) return;

    // Disconnect the previous observer if it exists
    if (observer.current) observer.current.disconnect();

    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more items to load
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.5 });

    // Observe the last element if it exists
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchLogs = async (pageNum: number) => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      setLoading(true);
      const pageFilters = {
        ...filters,
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE,
      };

      const data = await sleepLogService.getByUserId(user.id, pageFilters);

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
  }, [filters, user]);

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
          {logs.map((log, index) => {
            // Define swipe action buttons
            const leftAction = onDeleteLog && (
              <button 
                className="bg-red-500 text-white h-full px-4 flex items-center justify-center"
                aria-label="삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            );

            const rightAction = onEditLog && (
              <button 
                className="bg-blue-500 text-white h-full px-4 flex items-center justify-center"
                aria-label="수정"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            );

            return (
              <li key={log.id} ref={index === logs.length - 1 ? lastLogElementRef : null}>
                <SwipeableListItem
                  onSwipeLeft={onDeleteLog ? () => onDeleteLog(log) : undefined}
                  onSwipeRight={onEditLog ? () => onEditLog(log) : undefined}
                  leftAction={leftAction}
                  rightAction={rightAction}
                  onClick={() => onSelectLog(log)}
                  className="bg-white py-4 px-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-base">{formatDate(log.sleepTime)}</p>
                      <div className="flex flex-wrap items-center gap-x-4 mt-1">
                        <p className="text-sm text-gray-600">
                          {formatTime(log.sleepTime)} - {formatTime(log.wakeTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          수면 시간: {formatDuration(log.sleepDuration)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getQualityColor(log.quality)} mt-2 sm:mt-0 self-start sm:self-auto`}>
                      {log.quality}/10
                    </div>
                  </div>
                </SwipeableListItem>
              </li>
            );
          })}
        </ul>
      )}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center p-4">
          <p className="text-sm text-gray-500">스크롤하여 더 많은 기록 불러오기</p>
        </div>
      )}
    </div>
  );
};

export default SleepLogList;
