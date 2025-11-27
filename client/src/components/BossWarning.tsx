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
      <div className="absolute inset-0 bg-red-900/30 animate-pulse" />
      
      <div 
        className={`relative text-center ${shake ? 'translate-x-1' : '-translate-x-1'}`}
        style={{
          animation: 'bossWarningPulse 0.5s ease-in-out infinite'
        }}
      >
        <div className="relative">
          <h1 
            className="text-6xl md:text-8xl font-extrabold text-red-500 tracking-widest"
            style={{
              textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
              animation: 'bossTextGlow 0.3s ease-in-out infinite alternate'
            }}
          >
            BOSS INCOMING!
          </h1>
          
          <div className="absolute -inset-4 border-4 border-red-500/50 animate-ping" />
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-red-500" />
            <span className="text-4xl">
              {bossName?.includes("Necromancer") && "💀"}
              {bossName?.includes("Vampire") && "🧛"}
              {bossName?.includes("Golem") && "🗿"}
              {!bossName && "👹"}
            </span>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-red-500" />
          </div>
          
          <h2 
            className="text-3xl md:text-5xl font-bold text-white"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
            }}
          >
            {bossName || "Unknown Terror"}
          </h2>
          
          <p className="text-xl text-red-300 max-w-md mx-auto">
            {bossDescription || "A powerful enemy approaches..."}
          </p>
        </div>
        
        <div className="mt-8 flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
      <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse" />
      <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse" />
      
      <style>{`
        @keyframes bossWarningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes bossTextGlow {
          0% { 
            text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.6);
          }
          100% { 
            text-shadow: 0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.8), 0 0 80px rgba(239, 68, 68, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
