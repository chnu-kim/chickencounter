import milestones from '../data/milestones.json';
import './Milestone.css';

interface Props {
  totalPrice: number;
}

type State = 'achieved' | 'target' | 'upcoming';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function Milestone({ totalPrice }: Props) {
  const targetIndex = milestones.findIndex((m) => m.price > totalPrice);

  return (
    <ol className="timeline">
      {milestones.map((m, i) => {
        const state: State =
          targetIndex === -1 || i < targetIndex
            ? 'achieved'
            : i === targetIndex
              ? 'target'
              : 'upcoming';
        const remaining = state === 'target' ? m.price - totalPrice : null;

        return (
          <li key={m.price} className={`timeline__item timeline__item--${state}`}>
            <span className="timeline__dot" aria-hidden />
            <span className="timeline__label">{m.label}</span>
            <span className="timeline__price-group">
              {remaining !== null && (
                <span className="timeline__remaining">{formatPrice(remaining)}원 남음</span>
              )}
              <span className="timeline__price">{formatPrice(m.price)}원</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
