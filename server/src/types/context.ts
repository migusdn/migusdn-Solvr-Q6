import { UserService } from '../services/userService'
import { SleepLogService } from '../services/sleepLogService'

export type AppContext = {
  userService: UserService
  sleepLogService: SleepLogService
}
