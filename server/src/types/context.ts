import { UserService } from '../services/userService'
import { SleepLogService } from '../services/sleepLogService'
import { AuthService } from '../services/authService'

export type AppContext = {
  userService: UserService
  sleepLogService: SleepLogService
  authService: AuthService
}
