# TASK 3: [수면 통계 기능 - 통합]

## 3-1. 핵심 기능 목록
- 수면 트래커 페이지에서 통계 페이지로의 네비게이션 구현
- 수면 트래커와 통계 페이지 간의 데이터 일관성 유지
- 최적화된 API 호출 및 데이터 캐싱 전략
- 오류 처리 및 폴백 UI 구현

## 3-2. 통합 요구사항

### 3-2-1. 네비게이션 구조 업데이트
- 수면 트래커 페이지에 통계 페이지 링크 추가
- App.tsx 라우팅 구성 업데이트
- 모바일에서의 탭 기반 네비게이션 최적화

### 3-2-2. 데이터 일관성 유지
- 수면 기록 추가/수정/삭제 시 통계 데이터 자동 갱신
- 공통 데이터 관리 및 상태 공유 메커니즘 구현
- 데이터 불일치 방지를 위한 전략 수립

### 3-2-3. 성능 최적화
- API 호출 최소화를 위한 데이터 캐싱 구현
- 주요 통계 데이터의 로컬 스토리지 저장 및 관리
- 대시보드 컴포넌트의 지연 로딩 및 메모이제이션

### 3-2-4. 데이터 구조 및 통신 방법 명세
- 백엔드 API와 프론트엔드 컴포넌트 간의 데이터 흐름 정의
- 공통 데이터 모델 및 타입 정의

## 3-3. 구현 세부사항

### 3-3-1. 수면 트래커 페이지 업데이트

```typescript
// SleepTracker/index.tsx 수정 예시
import { Link } from 'react-router-dom';

// 기존 SleepTracker 컴포넌트 내부에 통계 페이지 링크 추가
return (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-center">수면 트래커</h1>
      <Link 
        to="/sleep-stats" 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        통계 보기
      </Link>
    </div>
    {renderView()}
  </div>
);
```

### 3-3-2. App.tsx 라우팅 업데이트

```typescript
// App.tsx 수정 예시
import SleepStatsPage from './routes/SleepStatsPage';

// 기존 Routes 내부에 수면 통계 라우트 추가
<Route path="sleep-stats" element={
  <ProtectedRoute>
    <SleepStatsPage />
  </ProtectedRoute>
} />
```

### 3-3-3. 공통 데이터 관리 서비스 구현

```typescript
// services/sleepStatsService.ts 구현 예시
import axios from 'axios';
import { SleepStatsResponse, SleepInsight, PeriodStats } from '../types/sleep-stats';

export const sleepStatsService = {
  // 요약 통계 조회
  getSummary: async (userId: string, startDate: string, endDate: string): Promise<SleepStatsResponse> => {
    const response = await axios.get('/api/sleep-stats/summary', {
      params: { userId, startDate, endDate }
    });
    return response.data;
  },

  // 기간별 통계 조회
  getPeriodStats: async (userId: string, period: string, startDate: string, endDate: string): Promise<PeriodStats[]> => {
    const response = await axios.get('/api/sleep-stats/period', {
      params: { userId, period, startDate, endDate }
    });
    return response.data.periodStats;
  },

  // 인사이트 조회
  getInsights: async (userId: string): Promise<SleepInsight[]> => {
    const response = await axios.get('/api/sleep-stats/insights', {
      params: { userId }
    });
    return response.data.insights;
  }
};
```

### 3-3-4. 오류 처리 및 폴백 UI

```typescript
// 에러 핸들링 훅 구현 예시
import { useState, useEffect } from 'react';

export const useSleepStats = (userId: string, startDate: string, endDate: string) => {
  const [data, setData] = useState<SleepStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await sleepStatsService.getSummary(userId, startDate, endDate);
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch sleep stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, startDate, endDate]);

  return { data, loading, error, refetch: () => { /* 데이터 리로드 로직 */ } };
};
```

## 3-4. 테스트 케이스

1. 수면 트래커 페이지에서 통계 페이지로의 네비게이션 테스트
2. 수면 기록 추가/수정/삭제 후 통계 데이터 갱신 확인
3. 오프라인 상태에서의 캐시된 데이터 표시 확인
4. 다양한 기간 설정에 따른 데이터 로딩 및 표시 테스트
5. 모바일 및 데스크톱 환경에서의 반응형 레이아웃 테스트
