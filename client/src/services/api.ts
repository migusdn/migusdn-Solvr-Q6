import axios from 'axios'
import { User, CreateUserDto, UpdateUserDto } from '../types/user'
import { SleepLog, CreateSleepLogDto, UpdateSleepLogDto, SleepLogFilters } from '../types/sleep-log'
import { SleepStatsResponse, PeriodStat, SleepInsight, SleepStatsFilters, SleepAIAnalysis } from '../types/sleep-stats'
import { getAccessToken } from '../utils/tokenUtils'

// API 응답 타입
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터: 액세스 토큰 포함
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터: 401 오류 시 토큰 갱신 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 오류이고 재시도하지 않았던 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 토큰 갱신 시도 (authService 순환 참조 방지를 위해 직접 import 하지 않음)
        // 대신 이벤트를 발생시켜 useAuth 훅에서 처리하도록 함
        const refreshEvent = new CustomEvent('auth:token-refresh-needed')
        window.dispatchEvent(refreshEvent)

        // 잠시 대기 후 토큰이 갱신되었을 것으로 가정하고 원래 요청 재시도
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 토큰 갱신 후 원래 요청 재시도
        const token = getAccessToken()
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // 갱신 실패 시 로그인 페이지로 리디렉션 이벤트 발생
        const logoutEvent = new CustomEvent('auth:logout-needed')
        window.dispatchEvent(logoutEvent)
      }
    }

    return Promise.reject(error)
  }
)

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users')
    return response.data.data || []
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    if (!response.data.data) {
      throw new Error('사용자를 찾을 수 없습니다.')
    }
    return response.data.data
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData)
    if (!response.data.data) {
      throw new Error('사용자 생성에 실패했습니다.')
    }
    return response.data.data
  },

  update: async (id: number, userData: UpdateUserDto): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData)
    if (!response.data.data) {
      throw new Error('사용자 정보 수정에 실패했습니다.')
    }
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  }
}

export const healthService = {
  check: async (): Promise<{ status: string }> => {
    const response = await api.get<ApiResponse<{ status: string }>>('/health')
    return response.data.data || { status: 'unknown' }
  }
}

export const sleepLogService = {
  getAll: async (filters?: SleepLogFilters): Promise<SleepLog[]> => {
    const response = await api.get<ApiResponse<SleepLog[]>>('/sleep-logs', { params: filters })
    return response.data.data || []
  },

  getByUserId: async (userId: number, filters?: SleepLogFilters): Promise<SleepLog[]> => {
    const response = await api.get<ApiResponse<SleepLog[]>>(`/sleep-logs/user/${userId}`, { params: filters })
    return response.data.data || []
  },

  getById: async (id: string): Promise<SleepLog> => {
    const response = await api.get<ApiResponse<SleepLog>>(`/sleep-logs/${id}`)
    if (!response.data.data) {
      throw new Error('수면 기록을 찾을 수 없습니다.')
    }
    return response.data.data
  },

  create: async (sleepLogData: CreateSleepLogDto): Promise<SleepLog> => {
    const response = await api.post<ApiResponse<SleepLog>>('/sleep-logs', sleepLogData)
    if (!response.data.data) {
      throw new Error('수면 기록 생성에 실패했습니다.')
    }
    return response.data.data
  },

  update: async (id: string, sleepLogData: UpdateSleepLogDto): Promise<SleepLog> => {
    const response = await api.put<ApiResponse<SleepLog>>(`/sleep-logs/${id}`, sleepLogData)
    if (!response.data.data) {
      throw new Error('수면 기록 수정에 실패했습니다.')
    }
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sleep-logs/${id}`)
  }
}

export const sleepStatsService = {
  // 종합 수면 통계 조회
  getSummary: async (filters: SleepStatsFilters): Promise<SleepStatsResponse> => {
    const response = await api.get<ApiResponse<SleepStatsResponse>>('/sleep-stats/summary', { params: filters })
    if (!response.data.data) {
      throw new Error('수면 통계 정보를 불러오는데 실패했습니다.')
    }
    return response.data.data
  },

  // 기간별 수면 통계 조회
  getPeriodStats: async (filters: SleepStatsFilters): Promise<PeriodStat[]> => {
    const response = await api.get<ApiResponse<{ periodStats: PeriodStat[] }>>('/sleep-stats/period', { params: filters })
    if (!response.data.data) {
      throw new Error('기간별 수면 통계 정보를 불러오는데 실패했습니다.')
    }
    return response.data.data.periodStats || []
  },

  // 수면 인사이트 조회
  getInsights: async (userId?: number): Promise<SleepInsight[]> => {
    const params = userId ? { userId } : {}
    const response = await api.get<ApiResponse<{ insights: SleepInsight[] }>>('/sleep-stats/insights', { params })
    if (!response.data.data) {
      throw new Error('수면 인사이트 정보를 불러오는데 실패했습니다.')
    }
    return response.data.data.insights || []
  },

  // AI 분석 데이터 조회
  getAIAnalysis: async (): Promise<SleepAIAnalysis> => {
    const response = await api.get<ApiResponse<SleepAIAnalysis>>('/sleep-stats/ai-analysis')
    if (!response.data.data) {
      throw new Error('AI 분석 데이터를 불러오는데 실패했습니다.')
    }
    return response.data.data
  },

  // AI 분석 데이터 새로고침
  refreshAIAnalysis: async (): Promise<SleepAIAnalysis> => {
    const response = await api.post<ApiResponse<SleepAIAnalysis>>('/sleep-stats/ai-analysis/refresh')
    if (!response.data.data) {
      throw new Error('AI 분석 데이터를 새로고침하는데 실패했습니다.')
    }
    return response.data.data
  }
}

export default api
