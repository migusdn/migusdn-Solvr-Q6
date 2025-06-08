import { FastifyRequest, FastifyReply } from 'fastify'
import { createSuccessResponse, createErrorResponse } from '../utils/response'
import { AuthService } from '../services/authService'
import { CreateUserDto } from '../types'

type AuthControllerDeps = {
  authService: AuthService
}

export const createAuthController = ({ authService }: AuthControllerDeps) => {
  /**
   * 사용자 로그인
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  const login = async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.code(400).send(createErrorResponse('이메일과 비밀번호를 입력해주세요.'))
      }

      try {
        const { accessToken, refreshToken, expiresIn } = await authService.login(email, password)

        // 리프레시 토큰을 HTTP Only 쿠키로 설정
        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/auth',
          maxAge: 60 * 60 * 24 * 7 // 7일
        })

        return reply.code(200).send(createSuccessResponse({ accessToken, expiresIn }))
      } catch (error) {
        return reply.code(401).send(createErrorResponse('이메일 또는 비밀번호가 올바르지 않습니다.'))
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('로그인 처리 중 오류가 발생했습니다.'))
    }
  }

  /**
   * 사용자 회원가입
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  const register = async (
    request: FastifyRequest<{ Body: CreateUserDto }>,
    reply: FastifyReply
  ) => {
    try {
      const userData = request.body

      if (!userData.name || !userData.email || !userData.password) {
        return reply.code(400).send(createErrorResponse('이름, 이메일, 비밀번호는 필수 입력 항목입니다.'))
      }

      try {
        const user = await authService.register(userData)

        // 비밀번호 필드 제외하고 응답
        const { password, ...userWithoutPassword } = user

        return reply
          .code(201)
          .send(createSuccessResponse(userWithoutPassword, '회원가입이 완료되었습니다.'))
      } catch (error) {
        if (error instanceof Error && error.message === '이미 사용 중인 이메일입니다.') {
          return reply.code(409).send(createErrorResponse(error.message))
        }
        throw error
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('회원가입 처리 중 오류가 발생했습니다.'))
    }
  }

  /**
   * 토큰 갱신
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshToken = request.cookies.refreshToken

      if (!refreshToken) {
        return reply.code(401).send(createErrorResponse('리프레시 토큰이 없습니다.'))
      }

      try {
        const { accessToken, expiresIn } = await authService.refreshToken(refreshToken)

        return reply.code(200).send(createSuccessResponse({ accessToken, expiresIn }))
      } catch (error) {
        return reply.code(401).send(createErrorResponse('유효하지 않은 리프레시 토큰입니다.'))
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('토큰 갱신 중 오류가 발생했습니다.'))
    }
  }

  /**
   * 로그아웃
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const refreshToken = request.cookies.refreshToken

      if (refreshToken) {
        authService.logout(refreshToken)
      }

      // 리프레시 토큰 쿠키 삭제
      reply.clearCookie('refreshToken', {
        path: '/api/auth'
      })

      return reply.code(200).send(createSuccessResponse({ success: true }))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('로그아웃 처리 중 오류가 발생했습니다.'))
    }
  }

  /**
   * 현재 인증된 사용자 정보 조회
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 인증 미들웨어에서 설정한 사용자 정보 사용
      if (!request.user || !request.user.id) {
        return reply.code(401).send(createErrorResponse('인증되지 않은 사용자입니다.'))
      }

      try {
        const user = await authService.getUserById(request.user.id)

        if (!user) {
          return reply.code(404).send(createErrorResponse('사용자를 찾을 수 없습니다.'))
        }

        // 비밀번호 필드 제외하고 응답
        const { password, ...userWithoutPassword } = user

        return reply.code(200).send(createSuccessResponse(userWithoutPassword))
      } catch (error) {
        throw error
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('사용자 정보 조회 중 오류가 발생했습니다.'))
    }
  }

  return {
    login,
    register,
    refreshToken,
    logout,
    getCurrentUser
  }
}

export type AuthController = ReturnType<typeof createAuthController>
