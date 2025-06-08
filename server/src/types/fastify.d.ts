import { FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    cookies: {
      [key: string]: string
    }
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: {
        domain?: string
        path?: string
        maxAge?: number
        expires?: Date | string | number
        httpOnly?: boolean
        secure?: boolean
        sameSite?: 'strict' | 'lax' | 'none'
      }
    ): FastifyReply
    
    clearCookie(
      name: string,
      options?: {
        domain?: string
        path?: string
      }
    ): FastifyReply
  }
}