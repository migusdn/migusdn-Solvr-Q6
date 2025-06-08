import React, { useState, useEffect } from 'react';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const PAGE_SIZE = 10;

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
        offset: (pageNum - 1) * PAGE_SIZE,
      };

      const data = await sleepLogService.getByUserId(user.id, pageFilters);
      setLogs(data);

      // Estimate total pages based on whether we got a full page of results
      if (data.length < PAGE_SIZE && pageNum === 1) {
        setTotalPages(1);
      } else if (data.length < PAGE_SIZE) {
        setTotalPages(pageNum);
      } else {
        // If we got a full page, there might be more pages
        // We'll set totalPages to current page + 1 as a minimum
        setTotalPages(Math.max(pageNum + 1, totalPages));
      }

      setError(null);
    } catch (err) {
      setError('수면 기록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch sleep logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLogs(1);
  }, [filters, user]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchLogs(newPage);
      // Scroll to top of the list
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">수면 기록 목록</h2>

      {logs.length === 0 && !loading ? (
        <div className="text-gray-500 p-3 sm:p-4 text-sm sm:text-base">기록된 수면 데이터가 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
          {logs.map((log) => {
            // Define swipe action buttons
            const leftAction = onDeleteLog && (
              <button 
                className="bg-red-500 text-white h-full px-3 sm:px-4 flex items-center justify-center"
                aria-label="삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            );

            const rightAction = onEditLog && (
              <button 
                className="bg-blue-500 text-white h-full px-3 sm:px-4 flex items-center justify-center"
                aria-label="수정"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            );

            return (
              <li key={log.id}>
                <SwipeableListItem
                  onSwipeLeft={onDeleteLog ? () => onDeleteLog(log) : undefined}
                  onSwipeRight={onEditLog ? () => onEditLog(log) : undefined}
                  leftAction={leftAction}
                  rightAction={rightAction}
                  onClick={() => onSelectLog(log)}
                  className="bg-white py-3 sm:py-4 px-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">{formatDate(log.sleepTime)}</p>
                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 mt-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatTime(log.sleepTime)} - {formatTime(log.wakeTime)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          수면 시간: {formatDuration(log.sleepDuration)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getQualityColor(log.quality)} mt-1 sm:mt-0 self-start sm:self-auto`}>
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

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2" aria-label="Pagination">
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="이전 페이지"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page numbers - on mobile, show limited pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // On mobile with many pages, show only current page and adjacent pages
                if (window.innerWidth < 640 && totalPages > 5) {
                  return page === 1 || page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                }
                return true;
              })
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}

            {/* Next page button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="다음 페이지"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SleepLogList;
