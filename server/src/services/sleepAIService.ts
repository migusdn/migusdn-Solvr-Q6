// server/src/services/sleepAIService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Database } from '../db';
import { SleepStatsService } from './sleepStatsService';

// 타입 정의
type SleepAIServiceDeps = {
  db: Database;
  sleepStatsService: SleepStatsService;
};

// AI 분석 결과 인터페이스
export interface SleepAIAnalysis {
  analysisId: string;
  userId: string;
  generatedAt: string;
  sleepPattern: {
    summary: string;
    averageDuration: number;
    qualityScore: number;
    consistency: number;
  };
  insights: Array<{
    type: 'strength' | 'improvement' | 'warning';
    title: string;
    description: string;
    confidenceScore: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
}

// 폴백 분석 제공 함수
const getFallbackAnalysis = (userId: string, sleepData: any): SleepAIAnalysis => {
  return {
    analysisId: `fallback-${Date.now()}`,
    userId: userId.toString(),
    generatedAt: new Date().toISOString(),
    sleepPattern: {
      summary: '수면 데이터 분석에 일시적인 문제가 발생했습니다.',
      averageDuration: sleepData.summary?.averageDuration || 0,
      qualityScore: sleepData.summary?.averageQuality || 0,
      consistency: 0,
    },
    insights: [
      {
        type: 'improvement',
        title: '데이터 수집 계속하기',
        description: '더 많은 수면 데이터를 기록하면 더 정확한 분석이 가능합니다.',
        confidenceScore: 1,
      },
    ],
    recommendations: [
      {
        title: '규칙적인 수면 습관 유지하기',
        description: '매일 같은 시간에 취침하고 기상하는 것이 수면의 질을 향상시킵니다.',
        priority: 'medium',
        actionable: true,
      },
    ],
  };
};

// AI 응답 파싱 함수
const parseAIResponse = (text: string): Partial<SleepAIAnalysis> => {
  try {
    // 간단한 파싱 로직 (실제로는 더 복잡할 수 있음)
    const summaryMatch = text.match(/수면 패턴 요약:(.*?)(?=주요 인사이트:|$)/s);
    const insightsMatch = text.match(/주요 인사이트:(.*?)(?=개인화된 권장사항:|$)/s);
    const recommendationsMatch = text.match(/개인화된 권장사항:(.*?)(?=$)/s);

    const summary = summaryMatch ? summaryMatch[1].trim() : '';
    
    // 인사이트 파싱
    const insights: SleepAIAnalysis['insights'] = [];
    if (insightsMatch) {
      const insightsText = insightsMatch[1];
      
      // 강점 파싱
      const strengthsMatch = insightsText.match(/강점:(.*?)(?=개선점:|경고사항:|$)/s);
      if (strengthsMatch) {
        const strengthsLines = strengthsMatch[1].trim().split('\n');
        for (const line of strengthsLines) {
          const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
          if (cleanLine) {
            const [title, ...descParts] = cleanLine.split(':');
            insights.push({
              type: 'strength',
              title: title.trim(),
              description: descParts.join(':').trim(),
              confidenceScore: 0.9,
            });
          }
        }
      }
      
      // 개선점 파싱
      const improvementsMatch = insightsText.match(/개선점:(.*?)(?=강점:|경고사항:|$)/s);
      if (improvementsMatch) {
        const improvementsLines = improvementsMatch[1].trim().split('\n');
        for (const line of improvementsLines) {
          const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
          if (cleanLine) {
            const [title, ...descParts] = cleanLine.split(':');
            insights.push({
              type: 'improvement',
              title: title.trim(),
              description: descParts.join(':').trim(),
              confidenceScore: 0.8,
            });
          }
        }
      }
      
      // 경고사항 파싱
      const warningsMatch = insightsText.match(/경고사항:(.*?)(?=강점:|개선점:|$)/s);
      if (warningsMatch) {
        const warningsLines = warningsMatch[1].trim().split('\n');
        for (const line of warningsLines) {
          const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
          if (cleanLine) {
            const [title, ...descParts] = cleanLine.split(':');
            insights.push({
              type: 'warning',
              title: title.trim(),
              description: descParts.join(':').trim(),
              confidenceScore: 0.7,
            });
          }
        }
      }
    }
    
    // 권장사항 파싱
    const recommendations: SleepAIAnalysis['recommendations'] = [];
    if (recommendationsMatch) {
      const recommendationsText = recommendationsMatch[1];
      const recommendationsLines = recommendationsText.trim().split('\n');
      
      for (const line of recommendationsLines) {
        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanLine) {
          const priorityMatch = cleanLine.match(/\[(높음|중간|낮음)\]/);
          const priority = priorityMatch 
            ? priorityMatch[1] === '높음' 
              ? 'high' 
              : priorityMatch[1] === '중간' 
                ? 'medium' 
                : 'low'
            : 'medium';
          
          const titleDescMatch = cleanLine.replace(/\[(높음|중간|낮음)\]/, '').split(':');
          
          if (titleDescMatch.length > 0) {
            recommendations.push({
              title: titleDescMatch[0].trim(),
              description: titleDescMatch.length > 1 ? titleDescMatch[1].trim() : '',
              priority,
              actionable: true,
            });
          }
        }
      }
    }
    
    return {
      sleepPattern: {
        summary,
        averageDuration: 0, // 이 값들은 실제 데이터로 채워질 것입니다
        qualityScore: 0,
        consistency: 0,
      },
      insights,
      recommendations,
    };
  } catch (error) {
    console.error('AI 응답 파싱 오류:', error);
    return {};
  }
};

// 수면 데이터 분석 함수
const generateSleepAnalysis = async (sleepData: any, userId: string) => {
  // API 키 및 모델 설정
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
    return getFallbackAnalysis(userId, sleepData);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  
  // 프롬프트 구성
  const prompt = `
    당신은 수면 분석 전문가입니다. 다음 사용자의 수면 데이터를 분석하고 인사이트와 개선 권장사항을 제공해주세요.

    ## 사용자 수면 데이터
    - 평균 수면 시간: ${sleepData.summary.averageDuration / 60} 시간
    - 수면 품질 점수: ${sleepData.summary.averageQuality}/10
    - 평균 취침 시간: ${sleepData.summary.averageBedtime}
    - 평균 기상 시간: ${sleepData.summary.averageWakeTime}
    - 수면 효율성: ${sleepData.summary.sleepEfficiency}%
    - 총 기록 수: ${sleepData.summary.totalLogs}회

    다음 형식으로 응답해주세요:
    
    수면 패턴 요약: (1-2문장)
    
    주요 인사이트:
    강점:
    - 강점1: 설명
    - 강점2: 설명
    - 강점3: 설명
    
    개선점:
    - 개선점1: 설명
    - 개선점2: 설명
    - 개선점3: 설명
    
    경고사항:
    - 경고1: 설명
    - 경고2: 설명
    
    개인화된 권장사항:
    - [높음] 권장사항1: 설명
    - [중간] 권장사항2: 설명
    - [낮음] 권장사항3: 설명
    - [높음] 권장사항4: 설명
    - [중간] 권장사항5: 설명

    응답은 한국어로 제공해주세요.
  `;

  try {
    // AI 응답 생성
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 응답 파싱 및 구조화
    const parsedResponse = parseAIResponse(text);
    
    // 실제 수면 데이터로 일부 필드 채우기
    return {
      analysisId: `ai-${Date.now()}`,
      userId: userId.toString(),
      generatedAt: new Date().toISOString(),
      sleepPattern: {
        ...parsedResponse.sleepPattern,
        averageDuration: sleepData.summary.averageDuration,
        qualityScore: sleepData.summary.averageQuality * 10, // 0-10 스케일을 0-100으로 변환
        consistency: Math.round(sleepData.summary.sleepEfficiency), // 일관성 점수로 수면 효율성 사용
      },
      insights: parsedResponse.insights || [],
      recommendations: parsedResponse.recommendations || [],
    };
  } catch (error) {
    console.error('AI 응답 생성 오류:', error);
    return getFallbackAnalysis(userId, sleepData);
  }
};

// 서비스 생성 함수
export const createSleepAIService = ({ db, sleepStatsService }: SleepAIServiceDeps) => {
  // 캐시 설정
  const analysisCache = new Map<string, { data: SleepAIAnalysis; timestamp: number }>();
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
  
  // 사용자 ID로 AI 분석 가져오기
  const getAnalysisByUserId = async (userId: string): Promise<SleepAIAnalysis> => {
    // 캐시 확인
    const cacheKey = `user-${userId}`;
    const cachedData = analysisCache.get(cacheKey);
    const now = Date.now();
    
    // 캐시된 데이터가 있고 유효한 경우
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      return cachedData.data;
    }
    
    try {
      // 사용자의 수면 통계 데이터 가져오기
      const sleepStats = await sleepStatsService.getSummaryByUserId(parseInt(userId, 10));
      
      if (!sleepStats || sleepStats.summary.totalLogs === 0) {
        throw new Error('수면 데이터가 없습니다.');
      }
      
      // AI 분석 생성
      const analysis = await generateSleepAnalysis(sleepStats, userId);
      
      // 캐시에 저장
      analysisCache.set(cacheKey, { data: analysis, timestamp: now });
      
      return analysis;
    } catch (error) {
      console.error(`사용자 ID ${userId}에 대한 AI 분석 생성 오류:`, error);
      throw error;
    }
  };
  
  // 캐시 무효화
  const invalidateCache = (userId: string): void => {
    const cacheKey = `user-${userId}`;
    analysisCache.delete(cacheKey);
  };
  
  return {
    getAnalysisByUserId,
    invalidateCache,
  };
};

export type SleepAIService = ReturnType<typeof createSleepAIService>;