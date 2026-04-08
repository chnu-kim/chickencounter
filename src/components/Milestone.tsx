import milestones from '../data/milestones.json';
import './Milestone.css';

interface Props {
  totalPrice: number;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function Milestone({ totalPrice }: Props) {
  const currentIndex = milestones.findLastIndex((m) => m.price <= totalPrice);
  const current = milestones[currentIndex];
  const next = milestones[currentIndex + 1];

  if (!current && !next) return null;

  return (
    <div className="milestone">
      {current && (
        <p className="milestone__row">
          <span className="milestone__tag">현재</span>
          <span className="milestone__label">{current.label}</span>
          <span className="milestone__price">{formatPrice(current.price)}원</span>
        </p>
      )}
      {next && (
        <p className="milestone__row milestone__row--next">
          <span className="milestone__tag">다음</span>
          <span className="milestone__label">{next.label}</span>
          <span className="milestone__price">{formatPrice(next.price)}원</span>
        </p>
      )}
    </div>
  );
}
