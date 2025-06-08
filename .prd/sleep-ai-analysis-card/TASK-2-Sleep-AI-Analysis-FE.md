# TASK 2: [수면 AI 분석 - FE]

## 2-1. 핵심 기능 목록
- 수면 통계 페이지에 AI 분석 카드 컴포넌트 추가
- 수면 패턴 요약 및 인사이트 시각화
- 개인화된 수면 개선 권장사항 표시
- 사용자 친화적인 분석 결과 표현

## 2-2. 프론트엔드 요구사항

### 2-2-1. UI/컴포넌트 구조
- `SleepAIAnalysisCard.tsx` 컴포넌트 개발
- 기존 `SleepStatsDashboard.tsx`에 AI 분석 카드 통합
- 반응형 디자인으로 모바일 및 데스크톱 환경 지원

### 2-2-2. 상태 관리 및 데이터 바인딩
- React hooks를 활용한 상태 관리
- 분석 데이터 로딩, 오류, 성공 상태 처리
- 로딩 중 스켈레톤 UI 구현

### 2-2-3. 상호작용 흐름
- 페이지 로드 시 자동으로 AI 분석 데이터 요청
- 사용자는 분석 결과 새로고침 요청 가능
- 권장사항 상세 정보 확장/축소 기능

### 2-2-4. 스타일/디자인 가이드라인
- 인사이트 유형별 색상 코딩 (강점: 녹색, 개선점: 파란색, 경고: 주황색)
- Tailwind CSS 활용한 카드 디자인
- 권장사항 우선순위 시각적 표시
- 접근성 표준 준수 (WCAG 2.1 AA)

### 2-2-5. BE-FE 데이터 구조 및 통신 방법 명세
- TypeScript 인터페이스 정의로 BE JSON 스키마 매핑

```typescript
interface SleepAIAnalysis {
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
```

- Axios 요청 예시 및 응답 처리 설명:

```typescript
// AI 분석 데이터 가져오기
const fetchAIAnalysis = async () => {
  setLoading(true);
  try {
    const response = await axios.get<SleepAIAnalysis>(
      '/api/v1/sleep-stats/ai-analysis',
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    setAnalysisData(response.data);
    setError(null);
  } catch (err) {
    setError('AI 분석 데이터를 가져오는 중 오류가 발생했습니다.');
    console.error('AI 분석 데이터 요청 실패:', err);
  } finally {
    setLoading(false);
  }
};
```

## 2-3. API 명세

### 2-3-1. 엔드포인트: `GET /api/v1/sleep-stats/ai-analysis`

### 2-3-2. 요청 파라미터:
- 헤더: Authorization Bearer 토큰 필요

### 2-3-3. 응답 형식:

```json
{
  "analysisId": "string",
  "userId": "string",
  "generatedAt": "string (ISO date)",
  "sleepPattern": {
    "summary": "string",
    "averageDuration": "number (hours)",
    "qualityScore": "number (0-100)",
    "consistency": "number (0-100)"
  },
  "insights": [
    {
      "type": "string (strength|improvement|warning)",
      "title": "string",
      "description": "string",
      "confidenceScore": "number (0-1)"
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "priority": "string (high|medium|low)",
      "actionable": "boolean"
    }
  ]
}
```

### 2-3-4. 오류 케이스 및 코드
- 401: 인증되지 않은 요청 - 로그인 페이지로 리다이렉트
- 403: 권한 없음 - 접근 거부 메시지 표시
- 404: 데이터 없음 - 빈 상태 UI 표시
- 429: 요청 한도 초과 - 나중에 다시 시도 메시지
- 500: 서버 오류 - 일반 오류 메시지 표시
