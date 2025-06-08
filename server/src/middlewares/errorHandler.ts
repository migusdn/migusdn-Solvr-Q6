import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // 인증 관련 오류 처리
  if (error.statusCode === 401) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: error.message || '인증이 필요합니다'
    });
  }

  // 권한 관련 오류 처리
  if (error.statusCode === 403) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: error.message || '이 작업을 수행할 권한이 없습니다'
    });
  }

  // JWT 토큰 관련 오류 처리
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: '유효하지 않은 토큰입니다'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: '토큰이 만료되었습니다'
    });
  }

  // 기타 오류 처리
  request.log.error(error);
  return reply.status(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message || '서버 오류가 발생했습니다'
  });
};