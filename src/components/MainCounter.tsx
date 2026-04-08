import './MainCounter.css';

interface Props {
  count: number;
  totalPrice: number;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function MainCounter({ count, totalPrice }: Props) {
  return (
    <div className="counter">
      <div className="counter__chicken">
        <span className="counter__number">{count}</span>
        <span className="counter__unit">마리</span>
      </div>
      <p className="counter__price">환산 금액 {formatPrice(totalPrice)}원</p>
    </div>
  );
}
