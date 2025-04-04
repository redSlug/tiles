import './Button.css';

function Button({
  onClick,
  value,
}: {
  onClick: () => void;
  value: string | undefined;
}) {
  return (
    <button className={'button'} onClick={onClick}>
      {value}
    </button>
  );
}

export default Button;
