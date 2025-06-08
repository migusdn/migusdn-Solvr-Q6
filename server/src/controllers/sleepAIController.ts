// server/src/controllers/sleepAIController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { SleepAIService } from '../services/sleepAIService';

// 타입 정의
type SleepAIControllerDeps = {
  sleepAIService: SleepAIService;
};

// 컨트롤러 생성 함수
export const createSleepAIController = ({ sleepAIService }: SleepAIControllerDeps) => {
  // 사용자 ID로 AI 분석 가져오기
  const getAnalysisByUserId = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };

      // 인증된 사용자 확인
      const authUser = request.user;
      if (!authUser) {
        return reply.status(401).send({
          success: false,
          message: '인증이 필요합니다.',
        });
      }

      // 권한 확인 (자신의 데이터만 접근 가능)
      if (authUser.id.toString() !== userId && authUser.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.',
        });
      }

      // AI 분석 가져오기
      const analysis = await sleepAIService.getAnalysisByUserId(userId);

      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('AI 분석 가져오기 오류:', error);

      // 오류 유형에 따른 응답
      if ((error as Error).message === '수면 데이터가 없습니다.') {
        return reply.status(404).send({
          success: false,
          message: '수면 데이터가 없습니다. 수면 기록을 먼저 추가해주세요.',
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'AI 분석을 가져오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 현재 사용자의 AI 분석 가져오기
  const getCurrentUserAnalysis = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 인증된 사용자 확인
      const authUser = request.user;
      if (!authUser) {
        return reply.status(401).send({
          success: false,
          message: '인증이 필요합니다.',
        });
      }

      // AI 분석 가져오기
      const analysis = await sleepAIService.getAnalysisByUserId(authUser.id.toString());

      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('현재 사용자 AI 분석 가져오기 오류:', error);

      // 오류 유형에 따른 응답
      if ((error as Error).message === '수면 데이터가 없습니다.') {
        return reply.status(404).send({
          success: false,
          message: '수면 데이터가 없습니다. 수면 기록을 먼저 추가해주세요.',
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'AI 분석을 가져오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 캐시 무효화 (새로고침)
  const refreshAnalysis = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 인증된 사용자 확인
      const authUser = request.user;
      if (!authUser) {
        return reply.status(401).send({
          success: false,
          message: '인증이 필요합니다.',
        });
      }

      // 캐시 무효화
      sleepAIService.invalidateCache(authUser.id.toString());

      // 새로운 분석 가져오기
      const analysis = await sleepAIService.getAnalysisByUserId(authUser.id.toString());

      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('AI 분석 새로고침 오류:', error);

      // 오류 유형에 따른 응답
      if ((error as Error).message === '수면 데이터가 없습니다.') {
        return reply.status(404).send({
          success: false,
          message: '수면 데이터가 없습니다. 수면 기록을 먼저 추가해주세요.',
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'AI 분석을 새로고침하는 중 오류가 발생했습니다.',
      });
    }
  };

  return {
    getAnalysisByUserId,
    getCurrentUserAnalysis,
    refreshAnalysis,
  };
};

export type SleepAIController = ReturnType<typeof createSleepAIController>;
