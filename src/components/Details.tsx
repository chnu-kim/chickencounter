import config from '../data/config.json';
import './Details.css';

interface Props {
  startDate: Date;
  excludedDay: string;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

const formattedPrice = config.pricePerChicken.toLocaleString('ko-KR');

export function Details({ startDate, excludedDay }: Props) {
  return (
    <p className="details">
      <span><span className="details__key">시작일</span> {shortDate(startDate)}</span>
      <span className="details__dot" aria-hidden="true" />
      <span><span className="details__key">제외</span> {excludedDay}</span>
      <span className="details__dot" aria-hidden="true" />
      <span><span className="details__key">기준 단가</span> {formattedPrice}원</span>
    </p>
  );
}
