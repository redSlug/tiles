import './Button.css';

function Button({
  onClick,
  value,
}: {
  onClick: () => void;
  value: string | undefined;
}) {
  return (
    <button className={'share-button'} key={`share-game`} onClick={onClick}>
      {value}
    </button>
  );
}

export default Button;
