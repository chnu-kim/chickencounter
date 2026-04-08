import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getChickenCount,
  getTotalPrice,
  isTodayTuesday,
  isActive,
  msUntilNextCutoff,
  getStartDate,
  PRICE_PER_CHICKEN,
} from './chickenCounter';
import config from '../data/config.json';

// KST = UTC+9. KST 특정 시각을 UTC Date로 생성하는 헬퍼
function kst(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
}

describe('isActive', () => {
  it('config.startDate가 설정되어 있으면 true', () => {
    // 현재 config.startDate = "2026-03-30"
    expect(isActive()).toBe(true);
  });
});

describe('config.json 정합성', () => {
  it('PRICE_PER_CHICKEN이 config.pricePerChicken과 일치', () => {
    expect(PRICE_PER_CHICKEN).toBe(config.pricePerChicken);
  });

  it('getStartDate()가 config.startDate와 일치', () => {
    const start = getStartDate();
    expect(start).not.toBeNull();
    const [year, month, day] = config.startDate!.split('-').map(Number);
    // KST 자정 = UTC 전날 15:00
    const expected = new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60_000);
    expect(start!.getTime()).toBe(expected.getTime());
  });
});

describe('getChickenCount', () => {
  // 기본 카운트
  it('시작일 21:05 이후 → 1마리', () => {
    expect(getChickenCount(kst(2026, 3, 30, 21, 5))).toBe(1);
  });

  it('시작일 21:05 이전 → 0마리 (유효 날짜가 전날)', () => {
    expect(getChickenCount(kst(2026, 3, 30, 15, 0))).toBe(0);
  });

  it('시작일 전날 → 0마리', () => {
    expect(getChickenCount(kst(2026, 3, 29, 22, 0))).toBe(0);
  });

  // 화요일 제외
  it('3/31(화) 21:05 이후 → 1마리 (화요일 제외)', () => {
    expect(getChickenCount(kst(2026, 3, 31, 21, 5))).toBe(1);
  });

  it('4/1(수) 21:05 이후 → 2마리', () => {
    expect(getChickenCount(kst(2026, 4, 1, 21, 5))).toBe(2);
  });

  // 주 단위 누적
  it('1주차 (3/30~4/5) → 6마리 (화요일 1회 제외)', () => {
    expect(getChickenCount(kst(2026, 4, 5, 21, 5))).toBe(6);
  });

  it('2주차 (3/30~4/12) → 12마리 (화요일 2회 제외)', () => {
    expect(getChickenCount(kst(2026, 4, 12, 21, 5))).toBe(12);
  });

  // cutoff 경계값
  it('21:04 → 전날까지만 카운트', () => {
    // 4/1(수) 21:04 → 유효 날짜 3/31(화) → 3/30까지만 = 1마리
    expect(getChickenCount(kst(2026, 4, 1, 21, 4))).toBe(1);
  });

  it('21:05 정각 → 당일 포함', () => {
    expect(getChickenCount(kst(2026, 4, 1, 21, 5))).toBe(2);
  });

  it('화요일 21:04 → 유효 날짜는 월요일', () => {
    expect(getChickenCount(kst(2026, 3, 31, 21, 4))).toBe(1);
  });

  it('자정(KST 0:00) → 유효 날짜는 전날', () => {
    expect(getChickenCount(kst(2026, 4, 2, 0, 0))).toBe(2);
  });

  // 장기 누적
  it('30일간 (3/30~4/28) → 25마리 (화요일 5회 제외)', () => {
    // 화요일: 3/31, 4/7, 4/14, 4/21, 4/28 = 5일, 30 - 5 = 25
    expect(getChickenCount(kst(2026, 4, 28, 21, 5))).toBe(25);
  });

  it('100일간 (3/30~7/7) → 85마리 (화요일 15회 제외)', () => {
    // 화요일: 3/31부터 7일 간격 15회, 100 - 15 = 85
    expect(getChickenCount(kst(2026, 7, 7, 21, 5))).toBe(85);
  });
});

describe('종료일(END_DATE) 로직', () => {
  const endDate = { year: 2026, month: 3, day: 5 }; // 2026-04-05 (일)

  it('종료일 이전 → 정상 카운트', () => {
    expect(getChickenCount(kst(2026, 4, 3, 21, 5), endDate)).toBe(4);
  });

  it('종료일 당일 → 종료일까지 카운트', () => {
    expect(getChickenCount(kst(2026, 4, 5, 21, 5), endDate)).toBe(6);
  });

  it('종료일 이후 → 종료일까지만 고정', () => {
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endDate)).toBe(6);
  });

  it('종료일 훨씬 이후에도 동일', () => {
    expect(getChickenCount(kst(2026, 7, 7, 21, 5), endDate)).toBe(6);
  });

  it('null이면 종료일 없이 계속 증가', () => {
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), null)).toBe(12);
  });

  it('종료일이 화요일 → 해당일 제외되어 전날까지 카운트', () => {
    const endTuesday = { year: 2026, month: 3, day: 7 }; // 4/7(화)
    // 3/30~4/7 중 비화요일: 3/31,4/7 제외 = 7마리
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endTuesday)).toBe(7);
  });

  it('종료일 = 시작일 → 1마리', () => {
    const endSameAsStart = { year: 2026, month: 2, day: 30 };
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endSameAsStart)).toBe(1);
  });

  it('종료일 < 시작일 → 0마리', () => {
    const endBeforeStart = { year: 2026, month: 2, day: 29 };
    expect(getChickenCount(kst(2026, 4, 12, 21, 5), endBeforeStart)).toBe(0);
  });

  it('종료일 당일 21:05 이전 → cutoff에 의해 종료일 미도달', () => {
    // 4/5 21:04 → 유효 날짜 4/4 → 종료일 제한 안 걸림 = 5마리
    expect(getChickenCount(kst(2026, 4, 5, 21, 4), endDate)).toBe(5);
  });
});

describe('isTodayTuesday', () => {
  it('화요일(3/31) 정오 → true', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 12, 0))).toBe(true);
  });

  it('월요일(3/30) → false', () => {
    expect(isTodayTuesday(kst(2026, 3, 30, 12, 0))).toBe(false);
  });

  it('수요일(4/1) → false', () => {
    expect(isTodayTuesday(kst(2026, 4, 1, 12, 0))).toBe(false);
  });

  it('화요일 자정 직후(0:01) → true', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 0, 1))).toBe(true);
  });

  it('화요일 23:59 → true', () => {
    expect(isTodayTuesday(kst(2026, 3, 31, 23, 59))).toBe(true);
  });

  it('수요일 0:00 → false (자정 경계 전환)', () => {
    expect(isTodayTuesday(kst(2026, 4, 1, 0, 0))).toBe(false);
  });
});

describe('getTotalPrice', () => {
  it('1마리 = PRICE_PER_CHICKEN', () => {
    expect(getTotalPrice(1)).toBe(PRICE_PER_CHICKEN);
  });

  it('N마리 = N × PRICE_PER_CHICKEN', () => {
    expect(getTotalPrice(8)).toBe(8 * PRICE_PER_CHICKEN);
  });

  it('0마리 = 0원', () => {
    expect(getTotalPrice(0)).toBe(0);
  });
});

describe('msUntilNextCutoff', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('cutoff 1시간 전 → 3,600,000ms', () => {
    vi.setSystemTime(kst(2026, 4, 1, 20, 5));
    expect(msUntilNextCutoff()).toBe(60 * 60_000);
  });

  it('cutoff 정각 → 다음 날까지 24시간', () => {
    vi.setSystemTime(kst(2026, 4, 1, 21, 5));
    expect(msUntilNextCutoff()).toBe(24 * 60 * 60_000);
  });

  it('cutoff 1분 후 → 23시간 59분', () => {
    vi.setSystemTime(kst(2026, 4, 1, 21, 6));
    expect(msUntilNextCutoff()).toBe(23 * 60 * 60_000 + 59 * 60_000);
  });

  it('항상 양수 반환', () => {
    vi.setSystemTime(kst(2026, 4, 1, 23, 59));
    expect(msUntilNextCutoff()).toBeGreaterThan(0);
  });
});
