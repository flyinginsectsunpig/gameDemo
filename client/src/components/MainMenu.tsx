
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
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-black to-black flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 animate-pulse">
          VAMPIRE SURVIVORS
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={onStartNew}
            className="w-64 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105"
          >
            NEW GAME
          </button>
          
          {hasSave && (
            <button
              onClick={onContinue}
              className="w-64 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105"
            >
              CONTINUE
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="w-64 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-lg transition-all"
          >
            SETTINGS
          </button>
          
          <button
            onClick={onQuit}
            className="w-64 px-8 py-4 bg-red-700 hover:bg-red-600 text-white text-xl font-bold rounded-lg transition-all"
          >
            QUIT
          </button>
        </div>

        <div className="mt-12 text-gray-400">
          <p>Total Runs: {saveData.stats.totalRuns}</p>
          <p>Highest Wave: {saveData.stats.highestWave}</p>
          <p>Total Kills: {saveData.stats.totalKills}</p>
        </div>
      </div>
    </div>
  );
}
