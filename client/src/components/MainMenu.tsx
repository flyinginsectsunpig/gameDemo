
import { useState } from "react";
import { SaveSystem } from "../lib/game/systems/SaveSystem";

interface MainMenuProps {
  onStartNew: () => void;
  onContinue: () => void;
  onQuit: () => void;
}

export default function MainMenu({ onStartNew, onContinue, onQuit }: MainMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const saveData = SaveSystem.load();
  const hasSave = saveData.stats.totalRuns > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'linear-gradient(180deg, #0a0608 0%, #120912 50%, #1b1a24 100%)' }}>
      <div className="gothic-vignette" />
      <div className="text-center relative z-10">
        <div className="gothic-divider mb-8 w-64 mx-auto" />
        
        <h1 className="gothic-title text-6xl md:text-7xl font-bold mb-2" style={{ color: '#c9a23f' }}>
          VAMPIRE
        </h1>
        <h1 className="gothic-title text-5xl md:text-6xl font-bold mb-8" style={{ color: '#8b2635' }}>
          SURVIVORS
        </h1>
        
        <div className="gothic-divider mb-8 w-64 mx-auto" />
        
        <div className="space-y-3">
          <button
            onClick={onStartNew}
            className="gothic-button gothic-button-primary w-64 px-8 py-4 rounded-lg text-base"
          >
            New Game
          </button>
          
          {hasSave && (
            <button
              onClick={onContinue}
              className="gothic-button w-64 px-8 py-4 rounded-lg text-base"
            >
              Continue
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="gothic-button w-64 px-8 py-4 rounded-lg text-base"
          >
            Settings
          </button>
          
          <button
            onClick={onQuit}
            className="gothic-button w-64 px-8 py-4 rounded-lg text-base"
            style={{ borderColor: '#5c1f2a' }}
          >
            Quit
          </button>
        </div>

        <div className="gothic-divider mt-8 mb-4 w-64 mx-auto" />

        <div className="gothic-panel rounded-lg p-4 mt-6 inline-block" style={{ borderColor: '#2b193d' }}>
          <div className="text-sm space-y-1" style={{ color: '#8b8b8b' }}>
            <p>Total Runs: <span style={{ color: '#d9d1c5' }}>{saveData.stats.totalRuns}</span></p>
            <p>Highest Wave: <span style={{ color: '#c9a23f' }}>{saveData.stats.highestWave}</span></p>
            <p>Total Kills: <span style={{ color: '#d9d1c5' }}>{saveData.stats.totalKills}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
