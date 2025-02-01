import './Tile.css';

function Tile({
  isDisabled,
  className,
  onClick,
  value = undefined,
}: {
  isDisabled: boolean;
  className: string;
  onClick: () => void;
  value: string | undefined;
}) {
  return (
    <button
      disabled={isDisabled}
      className={className}
      onClick={() => onClick()}
    >
      {value}
    </button>
  );
}

export default Tile;
