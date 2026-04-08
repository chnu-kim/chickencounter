import { useState, useEffect } from 'react';
import {
  getChickenCount,
  getStartDate,
  getTotalPrice,
  isTodayTuesday,
  msUntilNextCutoff,
} from '../utils/chickenCounter';

export interface ChickenCountData {
  count: number;
  totalPrice: number;
  isTuesday: boolean;
  today: Date;
  startDate: Date | null;
  excludedDay: string;
}

export function useChickenCount(): ChickenCountData {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const scheduleUpdate = () => {
      const ms = msUntilNextCutoff() + 100;
      return setTimeout(() => {
        setToday(new Date());
      }, ms);
    };

    const timerId = scheduleUpdate();
    return () => clearTimeout(timerId);
  }, [today]);

  const count = getChickenCount(today);

  return {
    count,
    totalPrice: getTotalPrice(count),
    isTuesday: isTodayTuesday(today),
    today,
    startDate: getStartDate(),
    excludedDay: '화요일',
  };
}
