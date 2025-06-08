import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import env from './config/env'
import { initializeDatabase, getDb } from './db'
import runMigration from './db/migrate'
import { createUserService } from './services/userService'
import { createSleepLogService } from './services/sleepLogService'
import { createSleepStatsService } from './services/sleepStatsService'
import { createAuthService } from './services/authService'
import { createRoutes } from './routes'
import { AppContext } from './types/context'
import { setupSecurityMiddleware } from './middlewares/security'
import { errorHandler } from './middlewares/errorHandler'
import { securityLogger } from './middlewares/securityLogger'

// Fastify 인스턴스 생성
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

// 서버 시작 함수
async function start() {
  try {
    // 보안 미들웨어 설정 (CORS 및 보안 헤더)
    await setupSecurityMiddleware(fastify)

    // 쿠키 설정
    await fastify.register(cookie, {
      secret: env.JWT_ACCESS_SECRET,
      hook: 'onRequest'
    })

    // 보안 로깅 미들웨어 등록
    fastify.addHook('onRequest', securityLogger)

    // 오류 처리 미들웨어 등록
    fastify.setErrorHandler(errorHandler)

    // 데이터베이스 마이그레이션 및 초기화
    try {
      await runMigration()
      await initializeDatabase()
    } catch (error) {
      fastify.log.error('데이터베이스 초기화 중 오류가 발생했습니다:', error)
      // 계속 진행 - 마이그레이션 실패해도 서버는 시작
    }

    // 서비스 및 컨텍스트 초기화
    const db = await getDb()
    const userService = createUserService({ db })
    const context: AppContext = {
      userService,
      sleepLogService: createSleepLogService({ db }),
      sleepStatsService: createSleepStatsService({ db }),
      authService: createAuthService({ userService })
    }

    // 라우트 등록
    await fastify.register(createRoutes(context))

    // 서버 시작
    await fastify.listen({ port: env.PORT, host: env.HOST })

    console.log(`서버가 http://${env.HOST}:${env.PORT} 에서 실행 중입니다.`)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

// 서버 시작
start()
