
import { useGameState } from "../lib/stores/useGameState";
import { SaveSystem } from "../lib/game/systems/SaveSystem";

export default function GameOverScreen() {
  const { phase, score, level, wave, maxCombo, restart } = useGameState();

  if (phase !== "gameOver") return null;

  const handleRestart = () => {
    restart();
  };

  const handleMainMenu = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-b from-red-900 to-black p-8 rounded-lg border-4 border-red-600 text-white max-w-md w-full">
        <h1 className="text-6xl font-bold text-center mb-6 text-red-500 animate-pulse">
          GAME OVER
        </h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-xl">
            <span className="text-gray-300">Final Score:</span>
            <span className="font-bold text-yellow-400">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-300">Level Reached:</span>
            <span className="font-bold text-purple-400">{level}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-300">Wave Survived:</span>
            <span className="font-bold text-blue-400">{wave}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="text-gray-300">Max Combo:</span>
            <span className="font-bold text-orange-400">{maxCombo}x</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Try Again (R)
          </button>
          <button
            onClick={handleMainMenu}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-lg font-bold rounded-lg transition-all"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
