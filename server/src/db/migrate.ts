import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'
import env from '../config/env'
import { users, sleepLogs } from './schema'
import { UserRole } from '../types'
import { generateSleepDataForUser } from '../scripts/generateSleepData'

// 데이터베이스 디렉토리 생성 함수
async function ensureDatabaseDirectory() {
  const dir = dirname(env.DATABASE_URL)
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

// 초기 사용자 데이터
const initialUsers = [
  {
    name: '관리자',
    email: 'admin@example.com',
    password: '$2b$10$P70YqKlDWE2nVdfOryNZbOxD42m.9DIFWYze.CfLtG/UXIG8jRPSG', // password: test123
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: '일반 사용자',
    email: 'user@example.com',
    password: '$2b$10$P70YqKlDWE2nVdfOryNZbOxD42m.9DIFWYze.CfLtG/UXIG8jRPSG', // password: test123
    role: UserRole.USER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: '게스트',
    email: 'guest@example.com',
    password: '$2b$10$P70YqKlDWE2nVdfOryNZbOxD42m.9DIFWYze.CfLtG/UXIG8jRPSG', // password: test123
    role: UserRole.GUEST,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 데이터베이스 마이그레이션 및 초기 데이터 삽입
async function runMigration() {
  try {
    // 데이터베이스 디렉토리 생성
    await ensureDatabaseDirectory()

    // 데이터베이스 연결
    const sqlite = new Database(env.DATABASE_URL)
    const db = drizzle(sqlite)

    // 스키마 생성
    console.log('데이터베이스 스키마 생성 중...')

    // users 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // sleep_logs 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sleep_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sleep_time TEXT NOT NULL,
        wake_time TEXT NOT NULL,
        sleep_duration INTEGER NOT NULL,
        quality INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 초기 데이터 삽입
    console.log('초기 데이터 삽입 중...')

    // 기존 데이터 확인
    const existingUsers = await db.select().from(users)
    const existingSleepLogs = await db.select().from(sleepLogs)

    if (existingUsers.length === 0) {
      // 초기 사용자 데이터 삽입
      for (let i = 0; i < initialUsers.length; i++) {
        const user = initialUsers[i]
        const result = await db.insert(users).values(user)
        const userId = Number(result.lastInsertRowid)

        // 사용자별 수면 더미 데이터 생성 및 삽입 (30일치)
        const userSleepLogs = generateSleepDataForUser(userId, 30, { missingDataProbability: 0.1 })

        // 배치 크기 설정 (한 번에 너무 많은 데이터를 삽입하지 않도록)
        const batchSize = 10
        for (let j = 0; j < userSleepLogs.length; j += batchSize) {
          const batch = userSleepLogs.slice(j, j + batchSize)
          await db.insert(sleepLogs).values(batch)
        }

        console.log(`사용자 ID ${userId}에 대한 ${userSleepLogs.length}개의 수면 기록이 추가되었습니다.`)
      }
      console.log(`${initialUsers.length}명의 사용자가 추가되었습니다.`)
    } else if (existingSleepLogs.length === 0) {
      // 사용자는 있지만 수면 기록이 없는 경우, 수면 기록만 추가
      for (const user of existingUsers) {
        // 사용자별 수면 더미 데이터 생성 및 삽입 (30일치)
        const userSleepLogs = generateSleepDataForUser(user.id, 30, { missingDataProbability: 0.1 })

        // 배치 크기 설정 (한 번에 너무 많은 데이터를 삽입하지 않도록)
        const batchSize = 10
        for (let j = 0; j < userSleepLogs.length; j += batchSize) {
          const batch = userSleepLogs.slice(j, j + batchSize)
          await db.insert(sleepLogs).values(batch)
        }

        console.log(`사용자 ID ${user.id}에 대한 ${userSleepLogs.length}개의 수면 기록이 추가되었습니다.`)
      }
    } else {
      console.log('사용자 데이터와 수면 기록이 이미 존재합니다. 초기 데이터 삽입을 건너뜁니다.')
    }

    console.log('데이터베이스 마이그레이션이 완료되었습니다.')
  } catch (error) {
    console.error('데이터베이스 마이그레이션 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행된 경우에만 마이그레이션 실행
if (require.main === module) {
  runMigration()
}

// 마이그레이션 함수 내보내기 (process.exit() 호출 없이)
export default async function() {
  try {
    await runMigration()
  } catch (error) {
    console.error('데이터베이스 마이그레이션 중 오류가 발생했습니다:', error)
    // 서버 시작 시에는 프로세스를 종료하지 않음
  }
}
