import { User, NewUser, UpdateUser, SleepLog, NewSleepLog, UpdateSleepLog } from '../db/schema'

// 사용자 관련 타입
export { User, NewUser, UpdateUser }

// 수면 기록 관련 타입
export { SleepLog, NewSleepLog, UpdateSleepLog }

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  totalPages: number
}

// 사용자 역할 타입
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// 사용자 생성 DTO
export interface CreateUserDto {
  name: string
  email: string
  role?: UserRole
}

// 사용자 수정 DTO
export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
}

// 수면 기록 생성 DTO
export interface CreateSleepLogDto {
  userId: number
  sleepTime: string
  wakeTime: string
  quality?: number
  notes?: string
}

// 수면 기록 수정 DTO
export interface UpdateSleepLogDto {
  sleepTime?: string
  wakeTime?: string
  quality?: number
  notes?: string
}

// 수면 기록 조회 필터 DTO
export interface SleepLogFilterDto {
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}
