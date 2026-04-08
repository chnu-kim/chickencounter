import config from '../data/config.json';

type KSTDate = { year: number; month: number; day: number };

function parseDate(dateStr: string): KSTDate {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

const START_DATE_KST: KSTDate | null = config.startDate ? parseDate(config.startDate) : null;
const END_DATE_KST: KSTDate | null = config.endDate ? parseDate(config.endDate) : null;

export function isActive(): boolean {
  return START_DATE_KST !== null;
}
const EXCLUDED_DAY = config.excludedDay;
const CUTOFF_HOUR = config.cutoffHour;
const CUTOFF_MINUTE = config.cutoffMinute;
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

/** 적립 기준 시각(KST cutoff) 기준으로 유효 KST 날짜를 반환 */
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

/** 오늘(KST 달력 기준)이 제외 요일인지 */
export function isTodayTuesday(date: Date): boolean {
  return toKST(date).dayOfWeek === EXCLUDED_DAY;
}

export function getChickenCount(
  targetDate: Date,
  overrideEndDate?: KSTDate | null,
): number {
  if (!START_DATE_KST) return 0;
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

/** 다음 KST cutoff까지 남은 ms */
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

export const PRICE_PER_CHICKEN = config.pricePerChicken;

export function getTotalPrice(count: number): number {
  return count * PRICE_PER_CHICKEN;
}

export function getStartDate(): Date | null {
  if (!START_DATE_KST) return null;
  return kstMidnightToUTC(START_DATE_KST.year, START_DATE_KST.month, START_DATE_KST.day);
}
