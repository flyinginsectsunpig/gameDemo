import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import BossHealthBar from "./BossHealthBar";
import BossWarning from "./BossWarning";

export default function GameUI() {
  const { phase, score, health, wave, maxHealth, experience, experienceToNext, level, selectedCharacter, isBossActive, showBossWarning } = useGameState();
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
              <p className="text-yellow-400 mb-2">Sylph Guardian - Nature magic with flower turrets</p>
              <p className="text-yellow-400 mb-2">Shadow Assassin - Fast & deadly with spider companions</p>
            </div>
            <div className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-500">
              <p className="text-red-300 font-bold">Boss fights every 5 waves!</p>
              <p className="text-sm text-gray-300 mt-1">Defeat powerful bosses to earn bonus rewards</p>
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
  const isBossWave = wave % 5 === 0;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <BossWarning />
      
      {isBossActive && <BossHealthBar />}
      
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 font-bold">HP</span>
              <div className="w-32 h-4 bg-red-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-200"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <span className="text-sm">{health}/{maxHealth}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 font-bold">Score</span>
              <span className="text-xl font-bold">{score.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-purple-400 font-bold">Lv</span>
              <span className="text-xl font-bold">{level}</span>
            </div>

            <div className={`flex items-center space-x-2 ${isBossWave ? 'animate-pulse' : ''}`}>
              <span className={`font-bold ${isBossWave ? 'text-red-400' : 'text-blue-400'}`}>
                {isBossWave ? 'BOSS' : 'Wave'}
              </span>
              <span className={`text-xl font-bold ${isBossWave ? 'text-red-400' : 'text-white'}`}>
                {wave}
              </span>
            </div>
          </div>
          
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
          
          {isBossWave && !isBossActive && (
            <div className="mt-2 text-xs text-red-400 animate-pulse">
              Boss wave! Prepare for battle...
            </div>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="bg-black bg-opacity-70 p-3 rounded-lg text-white hover:bg-opacity-90 transition-colors text-xl"
        >
          {isMuted ? "Muted" : "Sound"}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 p-2 rounded text-white text-sm">
        <div>WASD/Arrows: Move | M: Sound | R: Restart</div>
      </div>
      
      {isBossActive && (
        <div className="absolute bottom-4 right-4 bg-red-900/80 p-3 rounded-lg text-white border border-red-500">
          <div className="text-sm font-bold text-red-300">BOSS FIGHT ACTIVE</div>
          <div className="text-xs text-gray-300 mt-1">Defeat the boss to proceed!</div>
        </div>
      )}
    </div>
  );
}
