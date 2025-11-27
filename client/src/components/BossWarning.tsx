import { useGameState } from "../lib/stores/useGameState";
import { useEffect, useState } from "react";

export default function BossWarning() {
  const { showBossWarning, bossName, bossDescription } = useGameState();
  const [visible, setVisible] = useState(false);
  const [shake, setShake] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (showBossWarning) {
      setVisible(true);
      setFadeOut(false);
      setShake(true);
      
      const shakeInterval = setInterval(() => {
        setShake(prev => !prev);
      }, 100);
      
      const fadeTimeout = setTimeout(() => {
        setFadeOut(true);
      }, 3500);
      
      const hideTimeout = setTimeout(() => {
        setVisible(false);
        useGameState.getState().hideBossWarning();
      }, 4500);
      
      return () => {
        clearInterval(shakeInterval);
        clearTimeout(fadeTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [showBossWarning]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(92, 31, 42, 0.4) 0%, rgba(10, 6, 8, 0.9) 100%)' }} />
      <div className="gothic-vignette" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 20%, rgba(139, 38, 53, 0.3) 100%)' }} />
      
      <div 
        className={`relative text-center ${shake ? 'translate-x-1' : '-translate-x-1'}`}
        style={{
          animation: 'bossWarningPulse 0.5s ease-in-out infinite'
        }}
      >
        <div className="relative">
          <div className="gothic-divider mb-6 w-64 mx-auto" />
          
          <h1 
            className="gothic-title text-5xl md:text-7xl font-bold tracking-widest"
            style={{
              color: '#c9a23f',
              textShadow: '0 0 20px rgba(201, 162, 63, 0.8), 0 0 40px rgba(139, 38, 53, 0.6), 0 0 60px rgba(139, 38, 53, 0.4)',
              animation: 'bossTextGlow 0.3s ease-in-out infinite alternate'
            }}
          >
            BOSS INCOMING
          </h1>
          
          <div className="gothic-divider mt-6 w-64 mx-auto" />
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #8b2635)' }} />
            <span className="text-3xl" style={{ color: '#c9a23f' }}>
              {bossName?.includes("Necromancer") && "☠"}
              {bossName?.includes("Vampire") && "🦇"}
              {bossName?.includes("Golem") && "◆"}
              {!bossName && "◈"}
            </span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #8b2635, transparent)' }} />
          </div>
          
          <h2 
            className="gothic-title text-2xl md:text-4xl font-bold"
            style={{ color: '#d9d1c5' }}
          >
            {bossName || "Unknown Terror"}
          </h2>
          
          <p className="text-lg max-w-md mx-auto" style={{ color: '#8b8b8b', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
            {bossDescription || "A powerful enemy approaches..."}
          </p>
        </div>
        
        <div className="mt-8 flex justify-center space-x-3">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: '#8b2635', animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #8b2635, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #8b2635, transparent)' }} />
      
      <style>{`
        @keyframes bossWarningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes bossTextGlow {
          0% { 
            text-shadow: 0 0 20px rgba(201, 162, 63, 0.6), 0 0 40px rgba(139, 38, 53, 0.4);
          }
          100% { 
            text-shadow: 0 0 30px rgba(201, 162, 63, 0.9), 0 0 60px rgba(139, 38, 53, 0.6), 0 0 80px rgba(92, 31, 42, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
