# TASK 2: [수면 시간 트래커 - FE]

## 2-1. 핵심 기능 목록
- 사용자가 수면 시간을 기록할 수 있는 UI 구현
- 수면 기록 목록 조회 및 시각화
- 개별 수면 기록 조회, 수정, 삭제 기능
- 모바일 디바이스 최적화 UI/UX

## 2-2. 프론트엔드 요구사항

### 2-2-1. UI/컴포넌트 구조
- 메인 페이지: `SleepTracker.tsx`
  - 수면 기록 목록 표시
  - 주간/월간 요약 통계 표시
  - 새 기록 추가 버튼
- 수면 기록 폼: `SleepLogForm.tsx`
  - 취침 시간, 기상 시간 입력 (날짜 및 시간 선택기)
  - 수면 품질 점수 선택 (1-10)
  - 특이사항 메모 입력 영역
  - 저장/취소 버튼
- 수면 기록 상세: `SleepLogDetail.tsx`
  - 기록 상세 정보 표시
  - 수정/삭제 버튼
- 수면 기록 목록: `SleepLogList.tsx`
  - 기록 목록 표시 (날짜별)
  - 페이징 또는 무한 스크롤 기능

### 2-2-2. 상태 관리 및 데이터 바인딩
- 수면 기록 상태 관리: React 상태 관리 (useContext 또는 외부 라이브러리)
- API 연동: 수면 기록 CRUD 작업을 위한 서비스 함수 구현

### 2-2-3. 인터랙션 흐름
- 메인 페이지에서 "새 기록 추가" 버튼 클릭 → 수면 기록 폼 표시
- 폼 작성 후 저장 → API 호출 → 성공 시 목록 업데이트 및 폼 닫기
- 목록에서 기록 클릭 → 상세 정보 표시
- 상세 화면에서 수정/삭제 버튼 클릭 → 해당 작업 수행

### 2-2-4. 스타일/디자인 가이드라인
- 반응형 디자인: 모바일 우선 접근법
- 다크 모드 지원 (선택적)
- 수면 품질에 따른 시각적 표시 (색상 코드)
- 시간 선택기 모바일 최적화

### 2-2-5. BE-FE 데이터 구조 및 통신 방법
- API 클라이언트 구현: Axios를 활용한 RESTful API 통신
- TypeScript 인터페이스 정의:

```typescript
interface SleepLog {
  id: string;
  userId: string;
  sleepTime: string;
  wakeTime: string;
  sleepDuration: number;
  quality: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateSleepLogDto {
  sleepTime: string;
  wakeTime: string;
  quality: number;
  notes?: string;
}

interface UpdateSleepLogDto {
  sleepTime?: string;
  wakeTime?: string;
  quality?: number;
  notes?: string;
}
```

## 2-3. API 명세

### 2-3-1. 수면 기록 목록 조회
- 엔드포인트: `GET /api/sleep-logs`
- 클라이언트 구현 예시:
```typescript
const fetchSleepLogs = async (params?: { startDate?: string; endDate?: string; limit?: number; offset?: number }) => {
  const response = await axios.get('/api/sleep-logs', { params });
  return response.data;
};
```

### 2-3-2. 특정 수면 기록 조회
- 엔드포인트: `GET /api/sleep-logs/:id`
- 클라이언트 구현 예시:
```typescript
const fetchSleepLog = async (id: string) => {
  const response = await axios.get(`/api/sleep-logs/${id}`);
  return response.data;
};
```

### 2-3-3. 새 수면 기록 생성
- 엔드포인트: `POST /api/sleep-logs`
- 클라이언트 구현 예시:
```typescript
const createSleepLog = async (data: CreateSleepLogDto) => {
  const response = await axios.post('/api/sleep-logs', data);
  return response.data;
};
```

### 2-3-4. 수면 기록 업데이트
- 엔드포인트: `PUT /api/sleep-logs/:id`
- 클라이언트 구현 예시:
```typescript
const updateSleepLog = async (id: string, data: UpdateSleepLogDto) => {
  const response = await axios.put(`/api/sleep-logs/${id}`, data);
  return response.data;
};
```

### 2-3-5. 수면 기록 삭제
- 엔드포인트: `DELETE /api/sleep-logs/:id`
- 클라이언트 구현 예시:
```typescript
const deleteSleepLog = async (id: string) => {
  const response = await axios.delete(`/api/sleep-logs/${id}`);
  return response.data;
};
```

### 2-3-6. 오류 처리
- API 오류 처리 로직 구현
- 사용자 친화적인 오류 메시지 표시
