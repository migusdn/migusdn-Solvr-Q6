import { UserService } from '../services/userService'
import { SleepLogService } from '../services/sleepLogService'
import { SleepStatsService } from '../services/sleepStatsService'
import { AuthService } from '../services/authService'
import { SleepAIService } from '../services/sleepAIService'

export type AppContext = {
  userService: UserService
  sleepLogService: SleepLogService
  sleepStatsService: SleepStatsService
  authService: AuthService
  sleepAIService: SleepAIService
}
