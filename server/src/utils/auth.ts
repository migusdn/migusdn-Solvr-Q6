import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/authService'
import { createErrorResponse } from './response'

/**
 * 인증 미들웨어 생성 함수
 * @param authService 인증 서비스
 * @returns 인증 미들웨어 함수
 */
export const createAuthMiddleware = (authService: AuthService) => {
  /**
   * 인증 미들웨어
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send(createErrorResponse('인증이 필요합니다.'))
      }

      const token = authHeader.split(' ')[1]

      try {
        const decoded = authService.verifyToken(token)
        request.user = decoded
      } catch (error) {
        return reply.code(401).send(createErrorResponse('유효하지 않은 토큰 또는 토큰 만료'))
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('서버 오류'))
    }
  }
}

/**
 * 역할 기반 인증 미들웨어 생성 함수
 * @param authService 인증 서비스
 * @param roles 허용된 역할 배열
 * @returns 역할 기반 인증 미들웨어 함수
 */
export const createRoleMiddleware = (authService: AuthService, roles: string[]) => {
  /**
   * 역할 기반 인증 미들웨어
   * @param request Fastify 요청 객체
   * @param reply Fastify 응답 객체
   */
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send(createErrorResponse('인증이 필요합니다.'))
      }

      const token = authHeader.split(' ')[1]

      try {
        const decoded = authService.verifyToken(token)

        if (!roles.includes(decoded.role)) {
          return reply.code(403).send(createErrorResponse('접근 권한이 없습니다.'))
        }

        request.user = decoded
      } catch (error) {
        return reply.code(401).send(createErrorResponse('유효하지 않은 토큰 또는 토큰 만료'))
      }
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('서버 오류'))
    }
  }
}

// Fastify의 Request 인터페이스 확장
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number
      email: string
      role: string
    }
  }
}
