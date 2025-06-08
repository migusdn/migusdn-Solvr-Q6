import { FastifyRequest, FastifyReply } from 'fastify';

// 요청 시작 시간을 저장할 WeakMap
const requestStartTimes = new WeakMap<FastifyRequest, number>();

/**
 * 보안 로깅 미들웨어
 * 요청 시작 시간을 기록하고, 인증 관련 요청에 대한 로깅을 수행합니다.
 */
export const securityLogger = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // 요청 시작 시간 기록
  requestStartTimes.set(request, Date.now());

  // 응답 완료 후 로깅을 위한 훅 등록
  reply.raw.on('finish', () => {
    const startTime = requestStartTimes.get(request) || Date.now();
    const responseTime = Date.now() - startTime;
    const { method, url, ip } = request;
    const statusCode = reply.statusCode;
    
    // 인증 관련 로깅
    if (url.includes('/api/auth') || request.headers.authorization) {
      // 인증 성공 로깅
      if (statusCode < 400) {
        request.log.info({
          security: true,
          event: 'authentication_success',
          method,
          url,
          ip,
          statusCode,
          responseTime,
          user: request.user?.id || 'anonymous'
        });
      } 
      // 인증 실패 로깅
      else if (statusCode === 401 || statusCode === 403) {
        request.log.warn({
          security: true,
          event: 'authentication_failure',
          method,
          url,
          ip,
          statusCode,
          responseTime,
          reason: statusCode === 401 ? 'unauthorized' : 'forbidden'
        });
        
        // 여기에 실패한 인증 시도 추적 로직 추가 가능
        // 예: 특정 IP에서 여러 번 실패 시 차단 등
      }
    }
    
    // 요청 완료 후 WeakMap에서 시작 시간 제거
    requestStartTimes.delete(request);
  });
};