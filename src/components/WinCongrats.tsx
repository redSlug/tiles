import { useState } from 'react';
import './WinCongrats.css';

interface WinCongratsProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

export default function WinCongrats({ isOpen, onClose, score }: WinCongratsProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://beat-the-bot.vercel.app/api/winners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          score: score
        }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.log('error submitting score');
      }
    } catch (error) {
      console.log('error submitting score', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="win-modal-overlay">
      <div className="win-modal">
        <h2>congratulations!</h2>
        <p>you beat the bot!</p>
        <p>your score: {score}</p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">enter your name to join the leaderboard:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                required
              />
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'submitting...' : 'submit score'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            score submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
} 