const START_DATE_KST = { year: 2026, month: 2, day: 30 }; // 2026-03-30 (월요일)
const END_DATE_KST: { year: number; month: number; day: number } | null = null; // null이면 계속 증가, 날짜를 넣으면 해당일 이후 중단
const EXCLUDED_DAY = 2; // 화요일 (getDay(): 0=일, 1=월, 2=화)
const CUTOFF_HOUR = 21;
const CUTOFF_MINUTE = 5;
const KST_OFFSET = 9 * 60; // UTC+9 (분)

/** UTC Date를 KST 기준 연/월/일/시/분으로 분해 */
function toKST(date: Date) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  const kst = new Date(utcMs + KST_OFFSET * 60_000);
  return {
    year: kst.getFullYear(),
    month: kst.getMonth(),
    day: kst.getDate(),
    hours: kst.getHours(),
    minutes: kst.getMinutes(),
    dayOfWeek: kst.getDay(),
  };
}

/** KST 날짜를 UTC Date로 변환 (자정 기준) */
function kstMidnightToUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - KST_OFFSET * 60_000);
}

/** 적립 기준 시각(KST 21:05) 기준으로 유효 KST 날짜를 반환 */
function toEffectiveKSTDate(date: Date) {
  const kst = toKST(date);
  let { year, month, day } = kst;

  if (kst.hours < CUTOFF_HOUR ||
      (kst.hours === CUTOFF_HOUR && kst.minutes < CUTOFF_MINUTE)) {
    const prev = new Date(Date.UTC(year, month, day - 1));
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth();
    day = prev.getUTCDate();
  }

  return { year, month, day, dayOfWeek: new Date(Date.UTC(year, month, day)).getUTCDay() };
}

/** 오늘(KST 달력 기준)이 화요일인지 */
export function isTodayTuesday(date: Date): boolean {
  return toKST(date).dayOfWeek === EXCLUDED_DAY;
}

export function getChickenCount(
  targetDate: Date,
  overrideEndDate?: { year: number; month: number; day: number } | null,
): number {
  const startUTC = kstMidnightToUTC(START_DATE_KST.year, START_DATE_KST.month, START_DATE_KST.day);
  const effective = toEffectiveKSTDate(targetDate);
  let effectiveUTC = kstMidnightToUTC(effective.year, effective.month, effective.day);

  if (effectiveUTC < startUTC) return 0;

  const endDateKST = overrideEndDate !== undefined ? overrideEndDate : END_DATE_KST;
  if (endDateKST) {
    const endUTC = kstMidnightToUTC(endDateKST.year, endDateKST.month, endDateKST.day);
    if (effectiveUTC > endUTC) {
      effectiveUTC = endUTC;
    }
  }

  const diffDays = Math.round((effectiveUTC.getTime() - startUTC.getTime()) / 86_400_000);
  let count = 0;

  for (let i = 0; i <= diffDays; i++) {
    const kstDay = new Date(Date.UTC(START_DATE_KST.year, START_DATE_KST.month, START_DATE_KST.day + i)).getUTCDay();
    if (kstDay !== EXCLUDED_DAY) {
      count++;
    }
  }

  return count;
}

/** 다음 KST 21:05까지 남은 ms */
export function msUntilNextCutoff(): number {
  const now = new Date();
  const kst = toKST(now);

  let cutoffUTC = kstMidnightToUTC(kst.year, kst.month, kst.day);
  cutoffUTC = new Date(cutoffUTC.getTime() + (CUTOFF_HOUR * 60 + CUTOFF_MINUTE) * 60_000);

  if (now >= cutoffUTC) {
    cutoffUTC = new Date(cutoffUTC.getTime() + 86_400_000);
  }

  return cutoffUTC.getTime() - now.getTime();
}

export const PRICE_PER_CHICKEN = 26_500;

export function getTotalPrice(count: number): number {
  return count * PRICE_PER_CHICKEN;
}

export function getStartDate(): Date {
  return kstMidnightToUTC(START_DATE_KST.year, START_DATE_KST.month, START_DATE_KST.day);
}
