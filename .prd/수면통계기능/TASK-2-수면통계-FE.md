# TASK 2: [수면 통계 기능 - FE]

## 2-1. 핵심 기능 목록
- 수면 통계 전용 페이지 구현
- 다양한 차트와 그래프를 통한 데이터 시각화
- 기간별 수면 데이터 필터링 및 분석
- 모바일 최적화된 반응형 UI/UX 설계
- 인사이트 및 추천 사항 표시

## 2-2. 프론트엔드 요구사항

### 2-2-1. UI/컴포넌트 구조
- 수면 통계 페이지 (`SleepStatsPage.tsx`) 구현
- 메인 통계 대시보드 컴포넌트 (`SleepStatsDashboard.tsx`)
- 차트 컴포넌트 (`SleepDurationChart.tsx`, `SleepQualityChart.tsx`, `SleepPatternChart.tsx`)
- 기간 선택 필터 컴포넌트 (`PeriodSelector.tsx`)
- 인사이트 카드 컴포넌트 (`SleepInsightCard.tsx`)

### 2-2-2. 상태 관리 및 데이터 바인딩
- 통계 데이터 상태 관리 (React Context 또는 상태 관리 라이브러리 사용)
- API 연동을 위한 커스텀 훅 구현 (`useSleepStats`, `useSleepInsights`)
- 로딩 및 에러 상태 처리

### 2-2-3. 상호작용 흐름
- 페이지 로드 → 기본 통계 데이터 로드 (최근 30일)
- 기간 필터 변경 → 선택된 기간에 대한 통계 데이터 API 요청 → 차트 및 UI 업데이트
- 통계 타입 전환 (일별/주별/월별/연별) → 해당 기간별 데이터 요청 및 표시
- 차트 인터랙션 (호버, 클릭) → 상세 데이터 표시

### 2-2-4. 스타일/디자인 가이드라인
- Tailwind CSS를 활용한 모바일 우선 반응형 디자인
- 차트 라이브러리 (recharts, chart.js 등) 활용한 데이터 시각화
- 다크 모드 지원 및 접근성 고려
- 직관적인 색상 코딩 (수면 품질, 지표 등)

### 2-2-5. 데이터 구조 및 통신 방법 명세
- 백엔드 API 응답 구조와 매핑되는 TypeScript 인터페이스 정의
- Axios를 사용한 API 요청 및 응답 처리 예시

```typescript
// 수면 통계 관련 인터페이스
interface SleepSummary {
  totalLogs: number;
  averageDuration: number; // 분 단위
  averageQuality: number; // 1-10 점수
  averageBedtime: string; // HH:MM 형식
  averageWakeTime: string; // HH:MM 형식
  sleepEfficiency: number; // 백분율
}

interface SleepTrendPoint {
  date: string; // YYYY-MM-DD 형식
  value: number;
}

interface SleepTrends {
  duration: SleepTrendPoint[];
  quality: SleepTrendPoint[];
}

interface SleepPatterns {
  weekdayAvgDuration: number;
  weekendAvgDuration: number;
  consistencyScore: number;
}

interface SleepStatsResponse {
  summary: SleepSummary;
  trends: SleepTrends;
  patterns: SleepPatterns;
}

// API 요청 예시
const fetchSleepStats = async (userId: string, startDate: string, endDate: string): Promise<SleepStatsResponse> => {
  const response = await axios.get('/api/sleep-stats/summary', {
    params: { userId, startDate, endDate }
  });
  return response.data;
};
```

## 2-3. API 명세

### 2-3-1. 종합 수면 통계 조회

**엔드포인트**: `GET /api/sleep-stats/summary`

**요청 파라미터**:
```json
{
  "userId": "string",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)"
}
```

**응답 형식**:
```json
{
  "summary": {
    "totalLogs": "number",
    "averageDuration": "number (minutes)",
    "averageQuality": "number (1-10)",
    "averageBedtime": "string (HH:MM)",
    "averageWakeTime": "string (HH:MM)",
    "sleepEfficiency": "number (percentage)"
  },
  "trends": {
    "duration": [
      {"date": "string (YYYY-MM-DD)", "value": "number (minutes)"}
    ],
    "quality": [
      {"date": "string (YYYY-MM-DD)", "value": "number (1-10)"}
    ]
  },
  "patterns": {
    "weekdayAvgDuration": "number (minutes)",
    "weekendAvgDuration": "number (minutes)",
    "consistencyScore": "number (percentage)"
  }
}
```

### 2-3-2. 기간별 수면 통계 조회

**엔드포인트**: `GET /api/sleep-stats/period`

**요청 파라미터**:
```json
{
  "userId": "string",
  "period": "string (daily, weekly, monthly, yearly)",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)"
}
```

**응답 형식**:
```json
{
  "periodStats": [
    {
      "period": "string (period identifier)",
      "avgDuration": "number (minutes)",
      "avgQuality": "number (1-10)",
      "logsCount": "number"
    }
  ]
}
```

### 2-3-3. 수면 인사이트 조회

**엔드포인트**: `GET /api/sleep-stats/insights`

**요청 파라미터**:
```json
{
  "userId": "string"
}
```

**응답 형식**:
```json
{
  "insights": [
    {
      "type": "string (trend, anomaly, recommendation)",
      "message": "string",
      "data": {
        "metric": "string",
        "value": "number",
        "change": "number",
        "period": "string"
      }
    }
  ]
}
```

### 2-3-4. 오류 케이스 및 코드

- 400: 잘못된 요청 파라미터
- 401: 인증되지 않은 요청
- 403: 권한 없음 (다른 사용자의 데이터 접근 시도)
- 404: 해당 기간의 데이터 없음
- 500: 서버 내부 오류
