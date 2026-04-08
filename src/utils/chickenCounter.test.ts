import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getChickenCount,
  getTotalPrice,
  isTodayTuesday,
  msUntilNextCutoff,
  getStartDate,
  PRICE_PER_CHICKEN,
} from './chickenCounter';

// KST = UTC+9. KST 특정 시각을 UTC Date로 생성하는 헬퍼
function kst(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
}

describe('getChickenCount', () => {
  it('시작일(2026-03-30) 21:05 이후 → 1마리', () => {
    expect(getChickenCount(kst(2026, 3, 30, 21, 5))).toBe(1);
  });

  it('시작일(2026-03-30) 21:05 이전 → 0마리 (전날이 유효 날짜)', () => {
    expect(getChickenCount(kst(2026, 3, 30, 15, 0))).toBe(0);
  });

  it('시작일 전날 → 0마리', () => {
    expect(getChickenCount(kst(2026, 3, 29, 22, 0))).toBe(0);
  });

  it('2026-03-31(화) 21:05 이후 → 여전히 1마리 (화요일은 제외)', () => {
    // 3/30(월) = 1마리, 3/31(화) = 제외
    expect(getChickenCount(kst(2026, 3, 31, 21, 5))).toBe(1);
  });

  it('2026-04-01(수) 21:05 이후 → 2마리', () => {
    // 3/30(월)=1, 3/31(화)=제외, 4/1(수)=2
    expect(getChickenCount(kst(2026, 4, 1, 21, 5))).toBe(2);
  });

  it('첫 주 전체 (3/30~4/5) 21:05 이후 → 6마리', () => {
    // 3/30(월)=1, 3/31(화)=X, 4/1(수)=2, 4/2(목)=3, 4/3(금)=4, 4/4(토)=5, 4/5(일)=6
    expect(getChickenCount(kst(2026, 4, 5, 21, 5))).toBe(6);
  });

  it('2주차 (4/6~4/12) 화요일 4/7 제외 → 12마리', () => {
    // 1주: 6마리, 2주: 4/6(월)=7, 4/7(화)=X, 4/8(수)=8, 4/9(목)=9, 4/10(금)=10, 4/11(토)=11, 4/12(일)=12
    expect(getChickenCount(kst(2026, 4, 12, 21, 5))).toBe(12);
  });

  it('21:05 직전에는 전날까지만 카운트', () => {
    // 4/1(수) 21:04 → 유효 날짜는 3/31(화) → 화요일이라 3/30까지만 = 1마리
    expect(getChickenCount(kst(2026, 4, 1, 21, 4))).toBe(1);
  });

  it('21:05 정각에는 당일 포함', () => {
    // 4/1(수) 21:05 → 유효 날짜 4/1 → 3/30(1) + 4/1(2) = 2마리
    expect(getChickenCount(kst(2026, 4, 1, 21, 5))).toBe(2);
  });

  it('화요일 21:04 → 유효 날짜가 월요일이라 카운트 증가 없음', () => {
    // 3/31(화) 21:04 → 유효 날짜 3/30(월) = 1마리
    expect(getChickenCount(kst(2026, 3, 31, 21, 4))).toBe(1);
  });

  it('30일 누적 (3/30~4/28) → 화요일 4번 제외 = 26마리', () => {
    // 3/30~4/28 = 30일, 화요일: 3/31, 4/7, 4/14, 4/21, 4/28 = 5번
    // 하지만 4/28이 화요일이므로 유효 날짜 4/28 자체가 제외
    // 30 - 5 = 25마리? 아니 다시 세자:
    // 3/30(월)~4/28(화) = 30일간
    // 화요일: 3/31, 4/7, 4/14, 4/21, 4/28 = 5일
    // 비화요일: 30 - 5 = 25마리
    expect(getChickenCount(kst(2026, 4, 28, 21, 5))).toBe(25);
  });

  it('100일 누적 검증 — 수학적 계산과 일치', () => {
    // 3/30 + 99일 = 7/7(화)
    // 100일 중 화요일 수: floor(99/7)*1 + (시작 요일부터 남은 날 중 화요일 포함 여부)
    // 3/30(월) 시작, 매 7일마다 화요일 1번 = floor(99/7)=14, 나머지 1일(월)에 화요일 없음 = 14번
    // 100 - 14 = 86마리... 하지만 7/7이 화요일이므로 유효날짜가 화요일
    // 실제로는 3/30~7/7 포함하여 화요일은 15번 (3/31,4/7,...,7/7)
    // 아, 다시. 3/30~7/7 = 100일. 이 중 화요일 개수를 정확히 세자:
    // 3/31이 첫 화요일, 이후 7일 간격: 3/31,4/7,4/14,4/21,4/28,5/5,5/12,5/19,5/26,6/2,6/9,6/16,6/23,6/30,7/7 = 15번
    // 100 - 15 = 85마리
    expect(getChickenCount(kst(2026, 7, 7, 21, 5))).toBe(85);
  });

  it('자정(KST 0:00) → 유효 날짜는 전날', () => {
    // 4/2(목) 0:00 → 유효 날짜 4/1(수) = 2마리
    expect(getChickenCount(kst(2026, 4, 2, 0, 0))).toBe(2);
  });
});

describe('isTodayTuesday', () => {
  it('2026-03-31(화) → true', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 12, 0))).toBe(true);
  });

  it('2026-03-30(월) → false', () => {
    expect(isTodayTuesday(kst(2026, 3, 30, 12, 0))).toBe(false);
  });

  it('2026-04-01(수) → false', () => {
    expect(isTodayTuesday(kst(2026, 4, 1, 12, 0))).toBe(false);
  });

  it('화요일 자정 직후(KST 0:01)에도 화요일 판정', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 0, 1))).toBe(true);
  });

  it('화요일 23:59 → 여전히 화요일', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 23, 59))).toBe(true);
  });

  it('수요일 0:00 → 더 이상 화요일 아님', () => {
    expect(isTodayTuesday(kst(2026, 4, 1, 0, 0))).toBe(false);
  });
});

describe('getTotalPrice', () => {
  it('1마리 = 26,500원', () => {
    expect(getTotalPrice(1)).toBe(26_500);
  });

  it('8마리 = 212,000원', () => {
    expect(getTotalPrice(8)).toBe(212_000);
  });

  it('0마리 = 0원', () => {
    expect(getTotalPrice(0)).toBe(0);
  });
});

describe('msUntilNextCutoff', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('21:05 이전이면 당일 21:05까지 남은 시간 반환', () => {
    // KST 2026-04-01 20:05 → 21:05까지 60분 = 3,600,000ms
    vi.setSystemTime(kst(2026, 4, 1, 20, 5));
    expect(msUntilNextCutoff()).toBe(60 * 60_000);
  });

  it('21:05 정각이면 다음 날 21:05까지 = 24시간', () => {
    vi.setSystemTime(kst(2026, 4, 1, 21, 5));
    expect(msUntilNextCutoff()).toBe(24 * 60 * 60_000);
  });

  it('21:06이면 다음 날 21:05까지 = 23시간 59분', () => {
    vi.setSystemTime(kst(2026, 4, 1, 21, 6));
    expect(msUntilNextCutoff()).toBe(23 * 60 * 60_000 + 59 * 60_000);
  });

  it('반환값은 항상 양수', () => {
    vi.setSystemTime(kst(2026, 4, 1, 23, 59));
    expect(msUntilNextCutoff()).toBeGreaterThan(0);
  });
});

describe('종료일(END_DATE) 로직', () => {
  const endDate = { year: 2026, month: 3, day: 5 }; // 2026-04-05 (일)

  it('종료일 이전 → 정상 카운트', () => {
    // 4/3(금) 21:05 → 3/30(1), 4/1(2), 4/2(3), 4/3(4) = 4마리 (3/31 화요일 제외)
    expect(getChickenCount(kst(2026, 4, 3, 21, 5), endDate)).toBe(4);
  });

  it('종료일 당일 → 종료일까지 카운트', () => {
    // 4/5(일) 21:05 → 3/30~4/5 중 비화요일 = 6마리
    expect(getChickenCount(kst(2026, 4, 5, 21, 5), endDate)).toBe(6);
  });

  it('종료일 이후 → 종료일까지만 카운트 (고정)', () => {
    // 4/12(일) 21:05 → 종료일 4/5까지만 = 6마리
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endDate)).toBe(6);
  });

  it('종료일 훨씬 이후에도 값 동일', () => {
    // 7/7 21:05 → 여전히 6마리
    expect(getChickenCount(kst(2026, 7, 7, 21, 5), endDate)).toBe(6);
  });

  it('overrideEndDate가 null이면 종료일 없이 계속 증가', () => {
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), null)).toBe(12);
  });

  it('종료일이 화요일(4/7)이면 해당일은 제외되어 카운트 안 됨', () => {
    const endTuesday = { year: 2026, month: 3, day: 7 }; // 2026-04-07 (화)
    // 3/30(1), 4/1(2), 4/2(3), 4/3(4), 4/4(5), 4/5(6), 4/6(7) → 3/31,4/7 제외 = 7마리
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endTuesday)).toBe(7);
  });

  it('종료일 = 시작일 → 1마리', () => {
    const endSameAsStart = { year: 2026, month: 2, day: 30 }; // 2026-03-30
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endSameAsStart)).toBe(1);
  });

  it('종료일 < 시작일 → 0마리', () => {
    const endBeforeStart = { year: 2026, month: 2, day: 29 }; // 2026-03-29
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endBeforeStart)).toBe(0);
  });

  it('종료일 당일 21:05 이전 → 유효 날짜가 전날이므로 종료일 미포함', () => {
    const endDate2 = { year: 2026, month: 3, day: 5 }; // 2026-04-05
    // 4/5 21:04 → 유효 날짜 4/4 → 종료일(4/5) 이전이므로 종료일 제한 안 걸림
    // 3/30(1), 4/1(2), 4/2(3), 4/3(4), 4/4(5) = 5마리
    expect(getChickenCount(kst(2026, 4, 5, 21, 4), endDate2)).toBe(5);
  });
});

describe('상수 및 기본값', () => {
  it('PRICE_PER_CHICKEN = 26500', () => {
    expect(PRICE_PER_CHICKEN).toBe(26_500);
  });

  it('getStartDate()는 2026-03-30 KST 자정을 반환', () => {
    const start = getStartDate();
    // KST 자정 = UTC 전날 15:00
    expect(start.getUTCFullYear()).toBe(2026);
    expect(start.getUTCMonth()).toBe(2); // March
    expect(start.getUTCDate()).toBe(29);
    expect(start.getUTCHours()).toBe(15);
  });
});
