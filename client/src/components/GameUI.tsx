import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

export default function GameUI() {
  const { phase, score, health, wave, maxHealth, experience, experienceToNext, level, selectedCharacter } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  if (phase === "ready") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-red-500">VAMPIRE SURVIVORS</h1>
          <p className="text-xl mb-8">Survive the endless waves of enemies!</p>
          <div className="space-y-2 text-lg">
            <p><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move</p>
            <p><strong>Weapons fire automatically</strong></p>
            <p><strong>M</strong> - Toggle sound</p>
            <p><strong>R</strong> - Restart game</p>
            <div className="mt-6">
              <p className="text-yellow-400 mb-2">🌸 <strong>Sylph Guardian</strong> - Nature magic with flower turrets</p>
              <p className="text-yellow-400 mb-2">🕷️ <strong>Shadow Assassin</strong> - Fast & deadly with spider companions</p>
            </div>
          </div>
          <p className="text-sm mt-8 text-gray-400">Press any key or click to start</p>
        </div>
      </div>
    );
  }

  if (phase !== "playing") return null;

  const healthPercentage = (health / maxHealth) * 100;
  const experiencePercentage = (experience / experienceToNext) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-6">
            {/* Health Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-red-400 font-bold">❤️</span>
              <div className="w-32 h-4 bg-red-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-200"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <span className="text-sm">{health}/{maxHealth}</span>
            </div>

            {/* Score */}
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 font-bold">⭐</span>
              <span className="text-xl font-bold">{score.toLocaleString()}</span>
            </div>

            {/* Level */}
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 font-bold">🔰</span>
              <span className="text-xl font-bold">Level {level}</span>
            </div>

            {/* Wave */}
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 font-bold">🌊</span>
              <span className="text-xl font-bold">Wave {wave}</span>
            </div>
          </div>
          
          {/* Experience Bar */}
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-green-400 font-bold text-sm">EXP</span>
            <div className="w-48 h-3 bg-green-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-200"
                style={{ width: `${experiencePercentage}%` }}
              />
            </div>
            <span className="text-xs text-green-300">{experience}/{experienceToNext}</span>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="bg-black bg-opacity-70 p-3 rounded-lg text-white hover:bg-opacity-90 transition-colors"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Controls reminder */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 p-2 rounded text-white text-sm">
        <div>WASD/Arrows: Move | M: Sound | R: Restart</div>
        <div className="text-xs text-gray-400 mt-1">
          Debug: 1-SingleShot | 2-Spread | 3-Rapid | 4-Multi | 5-Pierce
        </div>
      </div>
    </div>
  );
}
