// server/src/services/sleepAIService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Database } from '../types/database';
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
  // 기본 폴백 데이터
  const fallbackData: SleepAIAnalysis = {
    analysisId: `fallback-${Date.now()}`,
    userId: userId.toString(),
    generatedAt: new Date().toISOString(),
    sleepPattern: {
      summary: '수면 데이터 분석에 일시적인 문제가 발생했습니다.',
      averageDuration: sleepData.summary?.averageDuration || 0,
      qualityScore: (sleepData.summary?.averageQuality || 0) * 10,
      consistency: sleepData.summary?.sleepEfficiency || 0,
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
      {
        title: '수면 환경 개선하기',
        description: '조용하고 어두운 환경에서 수면의 질이 향상됩니다.',
        priority: 'high',
        actionable: true,
      },
      {
        title: '취침 전 스크린 사용 줄이기',
        description: '취침 전 1시간은 스마트폰, TV 등의 스크린 사용을 피하는 것이 좋습니다.',
        priority: 'low',
        actionable: true,
      },
    ],
  };

  // 수면 데이터가 있는 경우 일부 정보 추가
  if (sleepData && sleepData.summary) {
    // 평균 수면 시간에 따른 인사이트 추가
    const avgHours = sleepData.summary.averageDuration / 60;
    if (avgHours < 6) {
      fallbackData.insights.push({
        type: 'warning',
        title: '수면 부족',
        description: '평균 수면 시간이 6시간 미만입니다. 성인의 권장 수면 시간은 7-9시간입니다.',
        confidenceScore: 0.9,
      });
    } else if (avgHours > 9) {
      fallbackData.insights.push({
        type: 'warning',
        title: '과도한 수면',
        description: '평균 수면 시간이 9시간을 초과합니다. 지나친 수면도 건강에 좋지 않을 수 있습니다.',
        confidenceScore: 0.8,
      });
    } else {
      fallbackData.insights.push({
        type: 'strength',
        title: '적정 수면 시간',
        description: '평균 수면 시간이 권장 범위(7-9시간) 내에 있습니다.',
        confidenceScore: 0.9,
      });
    }
  }

  return fallbackData;
};

// AI 응답 파싱 함수
const parseAIResponse = (text: string): Partial<SleepAIAnalysis> => {
  try {
    // JSON 파싱 시도
    const jsonData = JSON.parse(text);

    // 필요한 필드 검증 및 추출
    const sleepPattern = {
      summary: jsonData.sleepPattern?.summary || '수면 패턴 분석을 완료했습니다.',
      averageDuration: 0, // 이 값들은 실제 데이터로 채워질 것입니다
      qualityScore: 0,
      consistency: 0,
    };

    // 인사이트 검증 및 변환
    const insights: SleepAIAnalysis['insights'] = [];
    if (Array.isArray(jsonData.insights)) {
      for (const insight of jsonData.insights) {
        if (insight && typeof insight === 'object' && 
            ['strength', 'improvement', 'warning'].includes(insight.type) &&
            typeof insight.title === 'string' && 
            typeof insight.description === 'string') {
          insights.push({
            type: insight.type as 'strength' | 'improvement' | 'warning',
            title: insight.title,
            description: insight.description,
            confidenceScore: typeof insight.confidenceScore === 'number' ? insight.confidenceScore : 0.8,
          });
        }
      }
    }

    // 권장사항 검증 및 변환
    const recommendations: SleepAIAnalysis['recommendations'] = [];
    if (Array.isArray(jsonData.recommendations)) {
      for (const recommendation of jsonData.recommendations) {
        if (recommendation && typeof recommendation === 'object' &&
            typeof recommendation.title === 'string' &&
            typeof recommendation.description === 'string') {
          // 우선순위 검증
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (recommendation.priority === 'high' || recommendation.priority === '높음') {
            priority = 'high';
          } else if (recommendation.priority === 'low' || recommendation.priority === '낮음') {
            priority = 'low';
          }

          recommendations.push({
            title: recommendation.title,
            description: recommendation.description,
            priority,
            actionable: recommendation.actionable === false ? false : true,
          });
        }
      }
    }

    return {
      sleepPattern,
      insights,
      recommendations,
    };
  } catch (error) {
    console.error('AI 응답 JSON 파싱 오류:', error);
    console.error('원본 텍스트:', text);
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

    반드시 다음 JSON 형식으로만 응답해주세요. 다른 텍스트나 설명은 포함하지 마세요:

    {
      "sleepPattern": {
        "summary": "수면 패턴에 대한 1-2문장 요약"
      },
      "insights": [
        {
          "type": "strength",
          "title": "강점 제목",
          "description": "강점에 대한 설명",
          "confidenceScore": 0.9
        },
        {
          "type": "improvement",
          "title": "개선점 제목",
          "description": "개선점에 대한 설명",
          "confidenceScore": 0.8
        },
        {
          "type": "warning",
          "title": "경고 제목",
          "description": "경고에 대한 설명",
          "confidenceScore": 0.7
        }
      ],
      "recommendations": [
        {
          "title": "권장사항 제목",
          "description": "권장사항에 대한 설명",
          "priority": "high",
          "actionable": true
        },
        {
          "title": "권장사항 제목",
          "description": "권장사항에 대한 설명",
          "priority": "medium",
          "actionable": true
        },
        {
          "title": "권장사항 제목",
          "description": "권장사항에 대한 설명",
          "priority": "low",
          "actionable": true
        }
      ]
    }

    주의사항:
    1. 응답은 반드시 유효한 JSON 형식이어야 합니다.
    2. 모든 텍스트는 한국어로 작성해주세요.
    3. 인사이트는 최소 3개 이상 제공해주세요 (강점, 개선점, 경고 각각 최소 1개).
    4. 권장사항은 최소 3개 이상 제공해주세요 (우선순위 높음, 중간, 낮음 각각 최소 1개).
    5. priority 값은 "high", "medium", "low" 중 하나여야 합니다.
    6. type 값은 "strength", "improvement", "warning" 중 하나여야 합니다.
    7. confidenceScore 값은 0과 1 사이의 숫자여야 합니다.
  `;

  try {
    // AI 응답 생성 (JSON 형식 지정)
    const generationConfig = {
      temperature: 0.2, // 낮은 temperature로 더 일관된 응답 생성
      topK: 40,
      topP: 0.95,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    // 응답에서 JSON 부분만 추출 (경우에 따라 AI가 JSON 외에 다른 텍스트를 포함할 수 있음)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    // 응답 파싱 및 구조화
    const parsedResponse = parseAIResponse(jsonText);

    // 실제 수면 데이터로 일부 필드 채우기
    return {
      analysisId: `ai-${Date.now()}`,
      userId: userId.toString(),
      generatedAt: new Date().toISOString(),
      sleepPattern: {
        summary: parsedResponse.sleepPattern?.summary || '수면 패턴 분석을 완료했습니다.',
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
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const sleepStats = await sleepStatsService.getSummary(parseInt(userId, 10), startDate, endDate);

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
