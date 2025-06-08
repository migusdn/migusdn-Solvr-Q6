import { FastifyRequest, FastifyReply } from 'fastify';

export const checkRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 사용자 정보가 없으면 인증되지 않은 상태
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: '인증이 필요합니다'
      });
    }

    // 역할 확인
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: '이 작업을 수행할 권한이 없습니다'
      });
    }
  };
};