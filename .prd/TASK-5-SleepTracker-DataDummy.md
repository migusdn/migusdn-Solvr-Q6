# TASK 5: [수면 데이터 더미 생성]

## 5-1. 핵심 기능 목록
- 테스트 및 개발 목적의 가상 수면 데이터 생성
- 데이터베이스에 더미 데이터 삽입
- 다양한 패턴의 수면 데이터 생성으로 분석 기능 테스트 지원

## 5-2. 백엔드 요구사항

### 5-2-1. 더미 데이터 생성 스크립트 개발
- 사용자별 수면 데이터 생성 스크립트 작성: `server/src/scripts/generateSleepData.ts`
- 다양한 수면 패턴 및 품질 시나리오 생성 로직 구현
- 특이사항 생성을 위한 랜덤 텍스트 생성기 구현

### 5-2-2. 데이터 생성 규칙 정의
- 현실적인 수면/기상 시간 분포 (22:00-01:00 취침, 06:00-09:00 기상)
- 다양한 수면 품질 분포 (1-10 점수, 정규분포 적용)
- 요일별 패턴 차이 (주중과 주말의 수면 패턴 차이)
- 계절별 패턴 차이 (선택적)

### 5-2-3. 실행 및 설정 옵션
- 사용자 수 설정 옵션
- 생성할 데이터 기간 설정 옵션 (예: 지난 30일, 90일, 1년)
- 결측치 비율 설정 옵션 (랜덤으로 일부 날짜 데이터 누락)

## 5-3. 구현 상세

### 5-3-1. 더미 데이터 생성 함수

```typescript
// 사용자별 수면 데이터 생성 함수
function generateSleepDataForUser(userId: number, days: number, options: GenerationOptions): NewSleepLog[] {
  const sleepLogs: NewSleepLog[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    // 특정 확률로 데이터 건너뛰기 (결측치 생성)
    if (Math.random() < options.missingDataProbability) {
      continue;
    }

    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const dayOfWeek = date.getDay(); // 0: 일요일, 1-5: 월-금, 6: 토요일
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 수면 시간 생성 (주중/주말 다르게)
    const sleepHour = isWeekend 
      ? getRandomInt(22, 25) % 24 // 주말: 22:00-01:00
      : getRandomInt(21, 24); // 주중: 21:00-23:59

    const sleepMin = getRandomInt(0, 59);
    const sleepDate = new Date(date);
    sleepDate.setHours(sleepHour, sleepMin, 0, 0);

    // 이전 날짜로 설정 (자정 이후 취침 시)
    if (sleepHour >= 24) {
      sleepDate.setDate(sleepDate.getDate() - 1);
    }

    // 수면 시간 (시간)
    const sleepDurationHours = isWeekend 
      ? getRandomNormal(8, 1) // 주말: 평균 8시간, 표준편차 1시간
      : getRandomNormal(7, 1.2); // 주중: 평균 7시간, 표준편차 1.2시간

    // 분 단위 추가 (0-59분)
    const sleepDurationMinutes = getRandomInt(0, 59);

    // 기상 시간 계산
    const wakeDate = new Date(sleepDate);
    wakeDate.setTime(sleepDate.getTime() + (sleepDurationHours * 60 + sleepDurationMinutes) * 60 * 1000);

    // 수면 품질 점수 (1-10, 정규분포)
    const quality = Math.min(10, Math.max(1, Math.round(getRandomNormal(7, 2))));

    // 특이사항 생성
    const notes = generateRandomNote(quality);

    // 수면 시간 (분 단위)
    const sleepDuration = Math.round(sleepDurationHours * 60 + sleepDurationMinutes);

    // 수면 로그 생성
    sleepLogs.push({
      userId,
      sleepTime: sleepDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      sleepDuration,
      quality,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return sleepLogs;
}

// 정규분포를 따르는 난수 생성 (Box-Muller 변환)
function getRandomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// 범위 내 정수 난수 생성
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 품질 점수에 따른 특이사항 메모 생성
function generateRandomNote(quality: number): string {
  if (quality >= 8) {
    const goodNotes = [
      '매우 편안하게 잤어요.',
      '꿈을 꾸지 않고 깊게 잤어요.',
      '일찍 잠들어서 개운해요.',
      '방해 없이 잘 잤어요.',
      '아침에 상쾌하게 일어났어요.'
    ];
    return goodNotes[getRandomInt(0, goodNotes.length - 1)];
  } else if (quality >= 5) {
    const averageNotes = [
      '평범하게 잤어요.',
      '한 번 깼다가 다시 잠들었어요.',
      '약간 뒤척였지만 괜찮았어요.',
      '조금 일찍 일어났어요.',
      '잠은 잘 들었지만 중간에 화장실에 갔다왔어요.'
    ];
    return averageNotes[getRandomInt(0, averageNotes.length - 1)];
  } else {
    const badNotes = [
      '잠을 제대로 이루지 못했어요.',
      '악몽을 꿨어요.',
      '소음 때문에 자주 깼어요.',
      '더워서 잠을 설쳤어요.',
      '스트레스 때문에 잠들기 어려웠어요.',
      '밤중에 여러 번 깼어요.',
      '너무 춥거나 더웠어요.'
    ];
    return badNotes[getRandomInt(0, badNotes.length - 1)];
  }
}
```

### 5-3-2. 메인 실행 스크립트

```typescript
import { db } from '../db';
import { users, sleepLogs, NewSleepLog } from '../db/schema';

// 생성 옵션 타입
interface GenerationOptions {
  missingDataProbability: number; // 데이터 누락 확률 (0-1)
  startDate?: Date; // 시작 날짜 (기본: 현재)
  endDate?: Date; // 종료 날짜 (기본: 시작 날짜로부터 계산)
}

// 기본 옵션
const defaultOptions: GenerationOptions = {
  missingDataProbability: 0.1, // 10% 확률로 데이터 누락
};

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args[0]) || 5; // 기본 5명의 사용자
  const days = parseInt(args[1]) || 90; // 기본 90일치 데이터

  console.log(`Generating sleep data for ${userCount} users over ${days} days...`);

  // 사용자 가져오기
  const existingUsers = await db.select().from(users).limit(userCount);

  // 사용자 수가 충분하지 않으면 더 생성
  if (existingUsers.length < userCount) {
    const newUsers = [];
    for (let i = existingUsers.length; i < userCount; i++) {
      newUsers.push({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        role: 'USER'
      });
    }

    if (newUsers.length > 0) {
      await db.insert(users).values(newUsers);
      console.log(`Created ${newUsers.length} new test users.`);
    }
  }

  // 모든 사용자 다시 가져오기
  const allUsers = await db.select().from(users).limit(userCount);

  // 각 사용자에 대해 수면 데이터 생성 및 저장
  for (const user of allUsers) {
    console.log(`Generating data for user: ${user.name} (ID: ${user.id})`);

    const sleepData = generateSleepDataForUser(user.id, days, {
      ...defaultOptions,
    });

    // 배치 크기 설정 (한 번에 너무 많은 데이터를 삽입하지 않도록)
    const batchSize = 100;
    for (let i = 0; i < sleepData.length; i += batchSize) {
      const batch = sleepData.slice(i, i + batchSize);
      await db.insert(sleepLogs).values(batch);
    }

    console.log(`Added ${sleepData.length} sleep logs for user ${user.id}.`);
  }

  console.log('Finished generating sleep data.');
  process.exit(0);
}

// 스크립트 실행
main().catch(err => {
  console.error('Error generating sleep data:', err);
  process.exit(1);
});
```

## 5-4. 실행 지침

### 5-4-1. 스크립트 실행 방법
- 스크립트 위치: `server/src/scripts/generateSleepData.ts`
- 실행 명령어:
```bash
pnpm tsx server/src/scripts/generateSleepData.ts [사용자수] [일수]
```

### 5-4-2. 명령어 매개변수
- 첫 번째 매개변수: 생성할 사용자 수 (기본값: 5)
- 두 번째 매개변수: 생성할 일수 (기본값: 90)

### 5-4-3. 예시
```bash
# 10명의 사용자에 대해 30일치 데이터 생성
pnpm tsx server/src/scripts/generateSleepData.ts 10 30

# 기본값으로 실행 (5명의 사용자, 90일치 데이터)
pnpm tsx server/src/scripts/generateSleepData.ts
```

### 5-4-4. 추가 설정 옵션
필요에 따라 스크립트 내의 `defaultOptions` 변수를 수정하여 다음 옵션 조정 가능:
- `missingDataProbability`: 데이터 누락 확률 (0-1 사이 값)
- 추가 옵션 필요 시 `GenerationOptions` 인터페이스 확장

## 5-5. 테스트 및 검증

### 5-5-1. 데이터 검증

### 5-5-2. API 테스트
- 생성된 더미 데이터를 활용하여 모든 API 엔드포인트 테스트
- 특히 통계 및 분석 API의 정확성 검증

### 5-5-3. UI 테스트
- 프론트엔드에서 다양한 데이터 시각화 및 표시 테스트
- 모바일 UI에서의 대량 데이터 렌더링 성능 테스트
