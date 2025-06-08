import jwt from 'jsonwebtoken'
import { UserService } from './userService'
import { comparePassword, hashPassword } from '../utils/password'
import { CreateUserDto, User } from '../types'
import env from '../config/env'

// 토큰 블랙리스트 (로그아웃된 토큰 저장)
const tokenBlacklist = new Set<string>()

type AuthServiceDeps = {
  userService: UserService
}

export const createAuthService = ({ userService }: AuthServiceDeps) => {
  /**
   * 사용자 로그인
   * @param email 이메일
   * @param password 비밀번호
   * @returns 액세스 토큰과 만료 시간
   */
  const login = async (email: string, password: string) => {
    const user = await userService.getUserByEmail(email)

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    return generateTokens(user)
  }

  /**
   * 사용자 회원가입
   * @param userData 사용자 데이터
   * @returns 생성된 사용자
   */
  const register = async (userData: CreateUserDto): Promise<User> => {
    const existingUser = await userService.getUserByEmail(userData.email)

    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.')
    }

    const hashedPassword = await hashPassword(userData.password)

    return userService.createUser({
      ...userData,
      password: hashedPassword
    })
  }

  /**
   * 토큰 갱신
   * @param refreshToken 갱신 토큰
   * @returns 새로운 액세스 토큰과 만료 시간
   */
  const refreshToken = async (refreshToken: string) => {
    if (tokenBlacklist.has(refreshToken)) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: number }
      const user = await userService.getUserById(decoded.id)

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      return {
        accessToken: generateAccessToken(user),
        expiresIn: env.JWT_ACCESS_EXPIRATION
      }
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }
  }

  /**
   * 로그아웃
   * @param refreshToken 갱신 토큰
   */
  const logout = (refreshToken: string) => {
    tokenBlacklist.add(refreshToken)
    return { success: true }
  }

  /**
   * 토큰 검증
   * @param token 검증할 토큰
   * @returns 검증 결과
   */
  const verifyToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: number; role: string }

      // 사용자 정보에 email 추가 (필요한 경우 DB에서 조회)
      return {
        id: decoded.id,
        role: decoded.role,
        email: '' // 실제 구현에서는 DB에서 사용자 이메일을 조회해야 함
      }
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }
  }

  /**
   * 액세스 토큰 생성
   * @param user 사용자
   * @returns 액세스 토큰
   */
  const generateAccessToken = (user: User) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRATION }
    )
  }

  /**
   * 갱신 토큰 생성
   * @param user 사용자
   * @returns 갱신 토큰
   */
  const generateRefreshToken = (user: User) => {
    return jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRATION }
    )
  }

  /**
   * 토큰 생성
   * @param user 사용자
   * @returns 액세스 토큰, 갱신 토큰, 만료 시간
   */
  const generateTokens = (user: User) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRATION
    }
  }

  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  const getUserById = async (id: number) => {
    return userService.getUserById(id)
  }

  return {
    login,
    register,
    refreshToken,
    logout,
    verifyToken,
    getUserById
  }
}

export type AuthService = ReturnType<typeof createAuthService>
