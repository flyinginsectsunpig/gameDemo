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

  if (phase !== "paused") return null;

  const handleResume = () => {
    resume();
  };

  const handleRestart = () => {
    restart();
  };

  const handleMainMenu = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900 to-black p-8 rounded-lg border-4 border-purple-500 text-white">
        <h2 className="text-5xl font-bold text-center mb-8 text-purple-400">PAUSED</h2>

        <div className="space-y-4 min-w-[300px]">
          <button
            onClick={handleResume}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Resume (ESC)
          </button>

          <button
            onClick={toggleMute}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-bold rounded-lg transition-all"
          >
            Sound: {isMuted ? "OFF" : "ON"}
          </button>

          {onShowUpgradeShop && (
            <button
              onClick={onShowUpgradeShop}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white text-lg font-bold rounded-lg transition-all"
            >
              💰 Upgrade Shop
            </button>
          )}

          {onShowStatistics && (
            <button
              onClick={onShowStatistics}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-lg transition-all"
            >
              📊 Statistics
            </button>
          )}

          {onShowSettings && (
            <button
              onClick={onShowSettings}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-lg font-bold rounded-lg transition-all"
            >
              ⚙️ Settings
            </button>
          )}

          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-lg font-bold rounded-lg transition-all"
          >
            Restart (R)
          </button>

          <button
            onClick={handleMainMenu}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-lg font-bold rounded-lg transition-all"
          >
            Main Menu
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>ESC - Resume | M - Toggle Sound</p>
          <p>R - Restart Game</p>
        </div>
      </div>
    </div>
  );
}
