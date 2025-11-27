
import { useEffect, useState } from 'react';

export default function LevelUpEffect() {
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      setLevel(event.detail.level);
      setVisible(true);
      setTimeout(() => setVisible(false), 2000);
    };

    window.addEventListener('levelUp' as any, handleLevelUp);
    return () => window.removeEventListener('levelUp' as any, handleLevelUp);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-pulse">
        <div className="text-8xl font-bold text-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
          LEVEL UP!
        </div>
        <div className="text-6xl font-bold text-center text-white mt-4">
          Level {level}
        </div>
      </div>
      
      {/* Particle burst effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: '50%',
              top: '50%',
              animationDelay: `${i * 0.05}s`,
              transform: `translate(-50%, -50%) rotate(${i * 18}deg) translateY(-100px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
