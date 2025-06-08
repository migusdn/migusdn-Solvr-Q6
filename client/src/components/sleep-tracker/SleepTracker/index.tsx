import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SleepLog, SleepLogFilters } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';
import SleepLogList from '../SleepLogList';
import SleepLogDetail from '../SleepLogDetail';
import SleepLogForm from '../SleepLogForm';
import { useAuth } from '../../../hooks/useAuth';

enum ViewMode {
  LIST,
  DETAIL,
  CREATE,
  EDIT
}

export const SleepTracker: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [selectedLog, setSelectedLog] = useState<SleepLog | null>(null);
  const [filters, setFilters] = useState<SleepLogFilters>({});

  // Calculate default date range (one month)
  const getDefaultEndDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultStartDate = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [stats, setStats] = useState<{
    averageQuality: number;
    averageDuration: number;
    totalLogs: number;
  }>({
    averageQuality: 0,
    averageDuration: 0,
    totalLogs: 0
  });

  // Calculate stats from logs
  const calculateStats = async () => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Get logs for the current user
      const logs = await sleepLogService.getByUserId(user.id, filters);

      if (logs.length === 0) {
        setStats({
          averageQuality: 0,
          averageDuration: 0,
          totalLogs: 0
        });
        return;
      }

      const totalQuality = logs.reduce((sum, log) => sum + log.quality, 0);
      const totalDuration = logs.reduce((sum, log) => sum + log.sleepDuration, 0);

      setStats({
        averageQuality: Math.round((totalQuality / logs.length) * 10) / 10,
        averageDuration: Math.round(totalDuration / logs.length),
        totalLogs: logs.length
      });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [filters]);

  // Update filters when date range changes
  const handleDateRangeChange = () => {
    const newFilters: SleepLogFilters = {};

    if (startDate) {
      newFilters.startDate = startDate;
    }

    if (endDate) {
      newFilters.endDate = endDate;
    }

    // Add user ID to filters if user is authenticated
    if (user) {
      newFilters.userId = user.id;
    }

    setFilters(newFilters);
  };

  // Initialize filters with default date range and user ID on component mount
  useEffect(() => {
    handleDateRangeChange();
  }, [user]);

  const handleSelectLog = (log: SleepLog) => {
    setSelectedLog(log);
    setViewMode(ViewMode.DETAIL);
  };

  const handleCreateLog = () => {
    setSelectedLog(null);
    setViewMode(ViewMode.CREATE);
  };

  const handleEditLog = () => {
    setViewMode(ViewMode.EDIT);
  };

  const handleDeleteLog = () => {
    setSelectedLog(null);
    setViewMode(ViewMode.LIST);
    calculateStats(); // Refresh stats after deletion
  };

  const handleSaveLog = (log: SleepLog) => {
    setSelectedLog(log);
    setViewMode(ViewMode.DETAIL);
    calculateStats(); // Refresh stats after save
  };

  const handleCancel = () => {
    if (viewMode === ViewMode.EDIT || viewMode === ViewMode.CREATE) {
      if (selectedLog) {
        setViewMode(ViewMode.DETAIL);
      } else {
        setViewMode(ViewMode.LIST);
      }
    } else {
      setSelectedLog(null);
      setViewMode(ViewMode.LIST);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const renderView = () => {
    switch (viewMode) {
      case ViewMode.DETAIL:
        return selectedLog ? (
          <SleepLogDetail
            log={selectedLog}
            onEdit={handleEditLog}
            onDelete={handleDeleteLog}
            onClose={handleCancel}
          />
        ) : null;

      case ViewMode.CREATE:
        return (
          <SleepLogForm
            onSave={handleSaveLog}
            onCancel={handleCancel}
          />
        );

      case ViewMode.EDIT:
        return selectedLog ? (
          <SleepLogForm
            log={selectedLog}
            onSave={handleSaveLog}
            onCancel={handleCancel}
          />
        ) : null;

      case ViewMode.LIST:
      default:
        return (
          <div className="space-y-6">


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <h2 className="text-2xl font-bold">수면 기록</h2>
              <button
                onClick={handleCreateLog}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center sm:justify-start"
                aria-label="새 수면 기록 추가"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 기록 추가
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">기간 설정</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setTimeout(handleDateRangeChange, 0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setTimeout(handleDateRangeChange, 0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setTimeout(handleDateRangeChange, 0);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">수면 통계</h2>

              {stats.totalLogs === 0 ? (
                <p className="text-gray-500">아직 기록된 수면 데이터가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">총 기록 수</p>
                    <p className="text-2xl font-bold">{stats.totalLogs}회</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">평균 수면 시간</p>
                    <p className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg sm:col-span-2 md:col-span-1">
                    <p className="text-sm text-purple-700 font-medium">평균 수면 품질</p>
                    <p className="text-2xl font-bold">{stats.averageQuality}/10</p>
                  </div>
                </div>
              )}
            </div>
            <SleepLogList
              onSelectLog={handleSelectLog}
              onEditLog={handleEditLog}
              onDeleteLog={handleDeleteLog}
              filters={filters}
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">수면 트래커</h1>
        <Link 
          to="/sleep-stats" 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          통계 보기
        </Link>
      </div>
      {renderView()}
    </div>
  );
};

export default SleepTracker;
