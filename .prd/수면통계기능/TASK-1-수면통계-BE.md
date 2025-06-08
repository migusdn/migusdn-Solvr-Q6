# TASK 1: [수면 통계 기능 - BE]

## 1-1. 핵심 기능 목록
- 수면 기록 데이터 분석 및 통계 API 개발
- 다양한 통계 지표 제공 (주간/월간/연간 통계, 추세 분석 등)
- 개인화된 수면 패턴 분석 및 인사이트 제공
- 성능 최적화 및 데이터 캐싱

## 1-2. 백엔드 요구사항

### 1-2-1. 수면 통계 API 엔드포인트 구현
- 사용자별 수면 통계 데이터를 제공하는 API 엔드포인트 개발
- 기간별(일간, 주간, 월간, 연간) 통계 데이터 계산 및 제공
- 사용자 ID 기반 데이터 필터링 및 접근 제어

### 1-2-2. 통계 계산 서비스 구현
- 평균 수면 시간, 품질, 패턴 등 다양한 통계 지표 계산 로직 구현
- 시간대별 수면 패턴 분석 (취침/기상 시간 일관성 등)
- 수면 품질 추세 및 상관관계 분석 (요일, 계절별 패턴 등)

### 1-2-3. 데이터 최적화 및 성능 개선
- 자주 요청되는 통계 데이터의 캐싱 전략 구현
- 대용량 데이터 처리를 위한 쿼리 최적화
- 페이지네이션 및 부분 로딩 지원

### 1-2-4. 데이터 구조 및 통신 방법 명세
- 프론트엔드-백엔드 간 JSON 기반 데이터 교환 구조 정의
- 타입스크립트 인터페이스와 호환되는 응답 구조 설계

## 1-3. API 명세

### 1-3-1. 종합 수면 통계 조회

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

### 1-3-2. 기간별 수면 통계 조회

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

### 1-3-3. 수면 인사이트 조회

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

### 1-3-4. 오류 케이스 및 코드

- 400: 잘못된 요청 파라미터
- 401: 인증되지 않은 요청
- 403: 권한 없음 (다른 사용자의 데이터 접근 시도)
- 404: 해당 기간의 데이터 없음
- 500: 서버 내부 오류
