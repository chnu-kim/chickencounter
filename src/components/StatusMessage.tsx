import './StatusMessage.css';

interface Props {
  isTuesday: boolean;
}

export function StatusMessage({ isTuesday }: Props) {
  if (!isTuesday) return null;

  return (
    <div className="status-message">
      <p>오늘은 화요일이라 적립되지 않습니다</p>
    </div>
  );
}
