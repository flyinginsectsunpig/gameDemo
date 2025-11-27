import { useGameState } from "../lib/stores/useGameState";
import { useEffect, useState } from "react";

export default function BossHealthBar() {
  const { isBossActive, currentBossHealth, currentBossMaxHealth, bossName } = useGameState();
  const [displayHealth, setDisplayHealth] = useState(currentBossHealth);
  const [isLowHealth, setIsLowHealth] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  useEffect(() => {
    if (currentBossHealth < displayHealth) {
      setDamageFlash(true);
      const timeout = setTimeout(() => setDamageFlash(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [currentBossHealth, displayHealth]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      if (displayHealth !== currentBossHealth) {
        const diff = currentBossHealth - displayHealth;
        const step = diff * 0.1;
        if (Math.abs(diff) < 1) {
          setDisplayHealth(currentBossHealth);
        } else {
          setDisplayHealth(prev => prev + step);
        }
      }
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [displayHealth, currentBossHealth]);

  useEffect(() => {
    const healthPercent = currentBossHealth / currentBossMaxHealth;
    setIsLowHealth(healthPercent <= 0.25);
  }, [currentBossHealth, currentBossMaxHealth]);

  if (!isBossActive) return null;

  const healthPercentage = Math.max(0, (displayHealth / currentBossMaxHealth) * 100);
  const actualHealthPercentage = Math.max(0, (currentBossHealth / currentBossMaxHealth) * 100);

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <div 
        className={`gothic-panel rounded-lg p-4 ${damageFlash ? 'bg-red-900/30' : ''}`}
        style={{ borderColor: isLowHealth ? '#8b2635' : '#2b193d' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" style={{ color: '#c9a23f' }}>
              {bossName.includes("Necromancer") && "☠"}
              {bossName.includes("Vampire") && "🦇"}
              {bossName.includes("Golem") && "◆"}
            </span>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#d9d1c5', fontFamily: 'Cinzel, serif' }}>{bossName}</h2>
              <p className="text-xs" style={{ color: '#5c1f2a' }}>BOSS</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xl font-bold`} style={{ color: isLowHealth ? '#8b2635' : '#c9a23f', fontFamily: 'Cinzel, serif' }}>
              {Math.ceil(actualHealthPercentage)}%
            </span>
          </div>
        </div>
        
        <div className="relative h-5 rounded-full overflow-hidden" style={{ background: '#1b1a24', border: '1px solid #2b193d' }}>
          <div 
            className="absolute inset-0 transition-all duration-200"
            style={{ 
              width: `${healthPercentage}%`,
              background: 'linear-gradient(90deg, #5c1f2a 0%, #3d1520 100%)'
            }}
          />
          
          <div 
            className={`absolute inset-0 transition-all duration-75 ${isLowHealth ? 'animate-pulse' : ''}`}
            style={{ 
              width: `${actualHealthPercentage}%`,
              background: isLowHealth 
                ? 'linear-gradient(90deg, #8b2635 0%, #c04050 50%, #8b2635 100%)'
                : 'linear-gradient(90deg, #8b2635 0%, #a03040 50%, #8b2635 100%)',
              boxShadow: '0 0 10px rgba(139, 38, 53, 0.5)'
            }}
          />
          
          <div 
            className="absolute inset-0"
            style={{ 
              width: `${actualHealthPercentage}%`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}
          />
          
          {isLowHealth && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold animate-pulse" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                LOW HEALTH
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#5c5c5c' }}>
          <span>{Math.ceil(currentBossHealth)} HP</span>
          <span>{Math.ceil(currentBossMaxHealth)} MAX</span>
        </div>
      </div>
    </div>
  );
}
