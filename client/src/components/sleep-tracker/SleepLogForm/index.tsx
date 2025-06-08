import React, { useState, useEffect } from 'react';
import { SleepLog, CreateSleepLogDto, UpdateSleepLogDto } from '../../../types/sleep-log';
import { sleepLogService } from '../../../services/api';

interface SleepLogFormProps {
  log?: SleepLog;
  onSave: (log: SleepLog) => void;
  onCancel: () => void;
}

export const SleepLogForm: React.FC<SleepLogFormProps> = ({ log, onSave, onCancel }) => {
  const [sleepTime, setSleepTime] = useState<string>('');
  const [wakeTime, setWakeTime] = useState<string>('');
  const [quality, setQuality] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditMode = !!log;

  useEffect(() => {
    if (log) {
      // Format date-time strings for input elements
      const formatDateTimeForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      };

      setSleepTime(formatDateTimeForInput(log.sleepTime));
      setWakeTime(formatDateTimeForInput(log.wakeTime));
      setQuality(log.quality);
      setNotes(log.notes || '');
    } else {
      // Set default values for new log
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(22, 0, 0, 0);

      setSleepTime(yesterday.toISOString().slice(0, 16));
      setWakeTime(now.toISOString().slice(0, 16));
      setQuality(7);
      setNotes('');
    }
  }, [log]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!sleepTime) {
      errors.sleepTime = '취침 시간을 입력해주세요.';
    }

    if (!wakeTime) {
      errors.wakeTime = '기상 시간을 입력해주세요.';
    }

    if (sleepTime && wakeTime) {
      const sleepDate = new Date(sleepTime);
      const wakeDate = new Date(wakeTime);

      if (sleepDate >= wakeDate) {
        errors.wakeTime = '기상 시간은 취침 시간보다 나중이어야 합니다.';
      }

      // Check if sleep duration is reasonable (less than 24 hours)
      const durationMs = wakeDate.getTime() - sleepDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (durationHours > 24) {
        errors.wakeTime = '수면 시간이 24시간을 초과할 수 없습니다.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const sleepLogData: CreateSleepLogDto | UpdateSleepLogDto = {
        sleepTime,
        wakeTime,
        quality,
        notes: notes.trim() || undefined
      };

      let savedLog: SleepLog;

      if (isEditMode && log) {
        savedLog = await sleepLogService.update(log.id, sleepLogData);
      } else {
        savedLog = await sleepLogService.create(sleepLogData as CreateSleepLogDto);
      }

      onSave(savedLog);
    } catch (err) {
      setError(isEditMode 
        ? '수면 기록 수정에 실패했습니다.' 
        : '수면 기록 생성에 실패했습니다.');
      console.error('Failed to save sleep log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          {isEditMode ? '수면 기록 수정' : '새 수면 기록'}
        </h2>
        <button 
          onClick={onCancel}
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

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="sleepTime" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            취침 시간
          </label>
          <input
            type="datetime-local"
            id="sleepTime"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base ${
              validationErrors.sleepTime ? 'border-red-300' : ''
            }`}
            required
          />
          {validationErrors.sleepTime && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.sleepTime}</p>
          )}
        </div>

        <div>
          <label htmlFor="wakeTime" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            기상 시간
          </label>
          <input
            type="datetime-local"
            id="wakeTime"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base ${
              validationErrors.wakeTime ? 'border-red-300' : ''
            }`}
            required
          />
          {validationErrors.wakeTime && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.wakeTime}</p>
          )}
        </div>

        <div>
          <label htmlFor="quality" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            수면 품질 (1-10)
          </label>
          <div className="mt-1 sm:mt-2 mb-2 sm:mb-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-500">나쁨</span>
              <span className="text-base sm:text-lg font-medium">{quality}</span>
              <span className="text-xs sm:text-sm text-gray-500">좋음</span>
            </div>
            <input
              type="range"
              id="quality"
              min="1"
              max="10"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            메모 (선택사항)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
            placeholder="수면에 관한 특이사항이나 메모를 입력하세요."
          />
        </div>

        <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
            aria-label="취소"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
            aria-label={isSubmitting ? '저장 중...' : '저장'}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SleepLogForm;
