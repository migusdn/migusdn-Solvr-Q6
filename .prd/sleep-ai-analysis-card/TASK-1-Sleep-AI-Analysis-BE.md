# TASK 1: [수면 AI 분석 - BE]

## 1-1. 핵심 기능 목록
- 사용자의 수면 데이터를 분석하여 패턴 식별
- Google AI API를 활용한 수면 진단 및 조언 생성
- 수면 데이터 기반 개인화된 조언 제공
- 수면 개선을 위한 실행 가능한 권장사항 제공

## 1-2. BE 요구사항

### 1-2-1. Google AI Gemini API 통합
- Google AI JavaScript 클라이언트 라이브러리 설치 및 구성
- API 키 관리 및 환경 변수 설정
- 요청 빈도 제한 및 오류 처리 메커니즘 구현

### 1-2-2. 수면 데이터 분석 서비스 구현
- 사용자별 수면 데이터 수집 및 전처리
- 수면 패턴, 지속 시간, 품질 지표에 대한 통계 분석
- 이상 패턴 및 개선 가능한 영역 식별

### 1-2-3. AI 분석 엔드포인트 구현 (`GET /api/v1/sleep-stats/ai-analysis`)
- 사용자 ID 기반 개인화된 수면 분석 및 조언 제공
- 응답 시간 최적화를 위한 캐싱 전략 구현
- 정기적인 분석 업데이트 메커니즘

### 1-2-4. BE-FE 데이터 구조 및 통신 방법 명세
- 분석 결과를 표준화된 JSON 형식으로 제공
- 인증된 요청만 허용하는 보안 메커니즘 구현

## 1-3. API 명세

### 1-3-1. 엔드포인트: `GET /api/v1/sleep-stats/ai-analysis`

### 1-3-2. 요청 파라미터:
- URL 쿼리: `userId` (옵션, 인증된 사용자의 ID가 기본값)
- 헤더: Authorization Bearer 토큰 필요

### 1-3-3. 응답 형식:

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

### 1-3-4. 오류 케이스 및 코드
- 401: 인증되지 않은 요청
- 403: 권한 없음 (다른 사용자의 데이터 요청 시)
- 404: 사용자 또는 분석 데이터 없음
- 429: 요청 한도 초과
- 500: 서버 내부 오류 또는 AI 서비스 연결 문제
