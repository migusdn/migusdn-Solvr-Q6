# TASK 1: [수면 시간 트래커 - BE]

## 1-1. 핵심 기능 목록
- 사용자가 매일 수면 시간을 기록할 수 있도록 데이터 모델 및 API 엔드포인트 구현
- 수면 기록 조회, 생성, 수정 및 삭제 기능 제공
- 특이사항 등 부가 정보 기록 기능 제공

## 1-2. 백엔드 요구사항

### 1-2-1. 데이터 모델 정의 및 마이그레이션
- 수면 기록(SleepLog) 엔티티 생성
  - id: 고유 식별자
  - userId: 사용자 식별자
  - sleepTime: 취침 시간
  - wakeTime: 기상 시간
  - sleepDuration: 수면 시간(분)
  - quality: 수면 품질 점수(1-10)
  - notes: 특이사항 및 메모
  - createdAt: 기록 생성 시간
  - updatedAt: 기록 수정 시간

### 1-2-2. API 엔드포인트 구현
- 수면 기록 목록 조회 API: `GET /api/sleep-logs`
- 특정 수면 기록 조회 API: `GET /api/sleep-logs/:id`
- 새 수면 기록 생성 API: `POST /api/sleep-logs`
- 수면 기록 업데이트 API: `PUT /api/sleep-logs/:id`
- 수면 기록 삭제 API: `DELETE /api/sleep-logs/:id`

### 1-2-3. 유효성 검증 및 오류 처리
- 필수 필드 검증: sleepTime, wakeTime
- 논리적 검증: sleepTime은 wakeTime보다 이전이어야 함
- 수면 시간 계산 로직 구현

### 1-2-4. BE-FE 데이터 구조 및 통신 방법
- REST API를 통한 통신
- JSON 기반 요청/응답 구조

## 1-3. API 명세

### 1-3-1. 수면 기록 목록 조회
- 엔드포인트: `GET /api/sleep-logs`
- 쿼리 파라미터:
  - startDate: 조회 시작일(선택)
  - endDate: 조회 종료일(선택)
  - limit: 페이지당 항목 수(선택, 기본값 10)
  - offset: 페이지 오프셋(선택, 기본값 0)
- 응답 형식:
```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "sleepTime": "string",
      "wakeTime": "string",
      "sleepDuration": "number",
      "quality": "number",
      "notes": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

### 1-3-2. 특정 수면 기록 조회
- 엔드포인트: `GET /api/sleep-logs/:id`
- 응답 형식:
```json
{
  "id": "string",
  "userId": "string",
  "sleepTime": "string",
  "wakeTime": "string",
  "sleepDuration": "number",
  "quality": "number",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 1-3-3. 새 수면 기록 생성
- 엔드포인트: `POST /api/sleep-logs`
- 요청 파라미터:
```json
{
  "sleepTime": "string",
  "wakeTime": "string",
  "quality": "number",
  "notes": "string"
}
```
- 응답 형식:
```json
{
  "id": "string",
  "userId": "string",
  "sleepTime": "string",
  "wakeTime": "string",
  "sleepDuration": "number",
  "quality": "number",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 1-3-4. 수면 기록 업데이트
- 엔드포인트: `PUT /api/sleep-logs/:id`
- 요청 파라미터:
```json
{
  "sleepTime": "string",
  "wakeTime": "string",
  "quality": "number",
  "notes": "string"
}
```
- 응답 형식:
```json
{
  "id": "string",
  "userId": "string",
  "sleepTime": "string",
  "wakeTime": "string",
  "sleepDuration": "number",
  "quality": "number",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 1-3-5. 수면 기록 삭제
- 엔드포인트: `DELETE /api/sleep-logs/:id`
- 응답 형식:
```json
{
  "success": true
}
```

### 1-3-6. 오류 케이스 및 코드
- 400: 잘못된 요청 (필수 필드 누락, 유효성 검증 실패)
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류
