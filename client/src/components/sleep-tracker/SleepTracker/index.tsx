import React, { useState, useEffect } from 'react';
import { SleepLog, SleepLogFilters } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';
import SleepLogList from '../SleepLogList';
import SleepLogDetail from '../SleepLogDetail';
import SleepLogForm from '../SleepLogForm';

enum ViewMode {
  LIST,
  DETAIL,
  CREATE,
  EDIT
}

export const SleepTracker: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [selectedLog, setSelectedLog] = useState<SleepLog | null>(null);
  const [filters, setFilters] = useState<SleepLogFilters>({});
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
      // In a real app, this might be a separate API endpoint
      // For now, we'll fetch all logs and calculate stats client-side
      const logs = await sleepLogService.getAll();
      
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
  }, []);

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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">수면 통계</h2>
              
              {stats.totalLogs === 0 ? (
                <p className="text-gray-500">아직 기록된 수면 데이터가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">총 기록 수</p>
                    <p className="text-2xl font-bold">{stats.totalLogs}회</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">평균 수면 시간</p>
                    <p className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">평균 수면 품질</p>
                    <p className="text-2xl font-bold">{stats.averageQuality}/10</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">수면 기록</h2>
              <button
                onClick={handleCreateLog}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 기록 추가
              </button>
            </div>
            
            <SleepLogList
              onSelectLog={handleSelectLog}
              filters={filters}
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">수면 트래커</h1>
      {renderView()}
    </div>
  );
};

export default SleepTracker;