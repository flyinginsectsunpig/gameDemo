import { useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

interface PauseMenuProps {
  onShowSettings?: () => void;
  onShowStatistics?: () => void;
  onShowUpgradeShop?: () => void;
}

export default function PauseMenu({ onShowSettings, onShowStatistics, onShowUpgradeShop }: PauseMenuProps) {
  const { phase, resume, restart } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  useEffect(() => {
    if (phase !== "paused") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        resume();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [phase, resume]);

  if (phase !== "paused") return null;

  const handleResume = () => {
    resume();
  };

  const handleRestart = () => {
    restart();
  };

  const handleMainMenu = () => {
    // Reset to ready phase to show main menu
    useGameState.setState({ phase: "ready" });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel p-8 rounded-lg max-w-md w-full mx-4 relative z-10">
        <div className="gothic-divider mb-6" />
        
        <h2 className="gothic-title text-4xl font-bold text-center mb-8" style={{ color: '#c9a23f' }}>
          PAUSED
        </h2>

        <div className="space-y-3 min-w-[280px]">
          <button
            onClick={handleResume}
            className="gothic-button gothic-button-primary w-full px-6 py-3 rounded-lg text-base"
          >
            Resume Game
          </button>

          <button
            onClick={toggleMute}
            className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
          >
            Sound: {isMuted ? "OFF" : "ON"}
          </button>

          <div className="gothic-divider my-4" />

          {onShowUpgradeShop && (
            <button
              onClick={onShowUpgradeShop}
              className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
            >
              Upgrade Shop
            </button>
          )}

          {onShowStatistics && (
            <button
              onClick={onShowStatistics}
              className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
            >
              Statistics
            </button>
          )}

          {onShowSettings && (
            <button
              onClick={onShowSettings}
              className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
            >
              Settings
            </button>
          )}

          <div className="gothic-divider my-4" />

          <button
            onClick={handleRestart}
            className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
            style={{ borderColor: '#5c1f2a' }}
          >
            Restart Game
          </button>

          <button
            onClick={handleMainMenu}
            className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
          >
            Main Menu
          </button>
        </div>

        <div className="gothic-divider mt-6 mb-4" />
        
        <div className="text-center text-xs" style={{ color: '#5c5c5c' }}>
          <p>ESC - Resume | M - Toggle Sound | R - Restart</p>
        </div>
      </div>
    </div>
  );
}
