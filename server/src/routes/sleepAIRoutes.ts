// server/src/routes/sleepAIRoutes.ts
import { FastifyInstance } from 'fastify';
import { AppContext } from '../types/context';
import { createSleepAIController } from '../controllers/sleepAIController';

export const createSleepAIRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  // 컨트롤러 생성
  const sleepAIController = createSleepAIController({
    sleepAIService: context.sleepAIService
  });

  // 인증 미들웨어 적용
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // 현재 사용자의 AI 분석 가져오기
  fastify.get('/ai-analysis', sleepAIController.getCurrentUserAnalysis);

  // 특정 사용자의 AI 분석 가져오기
  fastify.get('/ai-analysis/user/:userId', sleepAIController.getAnalysisByUserId);

  // AI 분석 새로고침
  fastify.post('/ai-analysis/refresh', sleepAIController.refreshAnalysis);
};