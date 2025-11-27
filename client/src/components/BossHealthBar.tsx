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
        className={`bg-black bg-opacity-80 rounded-lg p-4 border-2 ${
          isLowHealth ? 'border-red-500 animate-pulse' : 'border-purple-600'
        } ${damageFlash ? 'bg-red-900 bg-opacity-60' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {bossName.includes("Necromancer") && "💀"}
              {bossName.includes("Vampire") && "🧛"}
              {bossName.includes("Golem") && "🗿"}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{bossName}</h2>
              <p className="text-xs text-gray-400">BOSS</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isLowHealth ? 'text-red-500' : 'text-white'}`}>
              {Math.ceil(actualHealthPercentage)}%
            </span>
          </div>
        </div>
        
        <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 transition-all duration-200"
            style={{ width: `${healthPercentage}%` }}
          />
          
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-75 ${
              isLowHealth ? 'animate-pulse' : ''
            }`}
            style={{ width: `${actualHealthPercentage}%` }}
          />
          
          <div 
            className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
            style={{ width: `${actualHealthPercentage}%` }}
          />
          
          {isLowHealth && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold drop-shadow-lg animate-pulse">
                LOW HEALTH!
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{Math.ceil(currentBossHealth)} HP</span>
          <span>{Math.ceil(currentBossMaxHealth)} MAX</span>
        </div>
      </div>
    </div>
  );
}
