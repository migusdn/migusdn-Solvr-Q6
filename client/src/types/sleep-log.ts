export interface SleepLog {
  id: string;
  userId: string;
  sleepTime: string;
  wakeTime: string;
  sleepDuration: number;
  quality: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepLogDto {
  sleepTime: string;
  wakeTime: string;
  quality: number;
  notes?: string;
}

export interface UpdateSleepLogDto {
  sleepTime?: string;
  wakeTime?: string;
  quality?: number;
  notes?: string;
}

export interface SleepLogFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  userId?: number;
}
