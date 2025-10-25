import './Modal.css';
import Button from './Button.tsx';

interface ButtonProps {
  isOpen: boolean;
  onClick: () => void;
  header: string;
  message: string;
  buttonValue: string | undefined;
}

export default function Modal({
  isOpen,
  onClick,
  header,
  message,
  buttonValue,
}: ButtonProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{header}</h2>
        <p>{message}</p>
        {buttonValue === undefined ? null : (
          <Button onClick={onClick} value={buttonValue} />
        )}
      </div>
    </div>
  );
}
