import { getDb } from '../db';
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

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args[0]) || 5; // 기본 5명의 사용자
  const days = parseInt(args[1]) || 90; // 기본 90일치 데이터

  console.log(`Generating sleep data for ${userCount} users over ${days} days...`);

  // 데이터베이스 연결 가져오기
  const db = await getDb();

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