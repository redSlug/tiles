import './Modal.css';
import Button from './Button.tsx';

interface ButtonProps {
  isOpen: boolean;
  onClose: () => void;
  header: string;
  message: string;
  buttonValue: string;
}

export default function Modal({
  isOpen,
  onClose,
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
        <Button onClick={onClose} value={buttonValue} />
      </div>
    </div>
  );
}
