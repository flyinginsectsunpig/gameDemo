import { useEffect, useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';

interface ComboDisplayProps {
  combo: number;
  multiplier: number;
  timeRemaining: number;
}

export default function ComboDisplay({ combo, multiplier, timeRemaining }: ComboDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(combo > 0);
  }, [combo]);

  if (!visible || combo === 0) return null;

  const timePercentage = Math.max(0, Math.min(100, (timeRemaining / 3) * 100));
  const isHighCombo = combo >= 20;
  const isMediumCombo = combo >= 10;

  const getColor = () => {
    if (isHighCombo) return '#c9a23f';
    if (isMediumCombo) return '#a03040';
    return '#9b7cb8';
  };

  return (
    <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40">
      <div 
        className={`gothic-panel rounded-lg p-4 ${isHighCombo ? 'animate-pulse' : ''}`}
        style={{ borderColor: getColor() }}
      >
        <div className="text-center">
          <div className="text-xs uppercase" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
            Combo
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ color: getColor(), fontFamily: 'Cinzel, serif' }}
          >
            {combo}
          </div>
          <div className="text-base mt-1" style={{ color: '#d9d1c5' }}>
            {multiplier.toFixed(2)}x
          </div>

          <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1b1a24', border: '1px solid #2b193d' }}>
            <div 
              className="h-full transition-all duration-100"
              style={{ 
                width: `${timePercentage}%`,
                background: getColor(),
                boxShadow: `0 0 8px ${getColor()}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
