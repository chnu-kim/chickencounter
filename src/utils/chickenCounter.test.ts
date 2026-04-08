import { describe, it, expect } from 'vitest';
import {
  getChickenCount,
  getTotalPrice,
  isTodayTuesday,
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
