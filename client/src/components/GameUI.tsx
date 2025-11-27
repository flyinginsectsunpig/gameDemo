import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import BossHealthBar from "./BossHealthBar";
import BossWarning from "./BossWarning";
import ComboDisplay from "./ComboDisplay";
import Minimap from "./Minimap";

interface GameUIProps {
  onShowUpgradeShop?: () => void;
  onShowStatistics?: () => void;
  onShowSettings?: () => void;
}

export default function GameUI({ onShowUpgradeShop, onShowStatistics, onShowSettings }: GameUIProps = {}) {
  const { phase, score, health, wave, maxHealth, experience, experienceToNext, level, selectedCharacter, isBossActive, showBossWarning, comboCount, comboMultiplier, currency, totalKills } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  if (phase === "ready") {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a0608 0%, #120912 50%, #1b1a24 100%)' }}>
        <div className="gothic-vignette" />
        <div className="text-center max-w-3xl px-8 relative z-10">
          <div className="gothic-divider mb-8 w-full" />
          
          <h1 className="gothic-title text-6xl md:text-7xl font-bold mb-2" style={{ color: '#c9a23f' }}>
            VAMPIRE
          </h1>
          <h1 className="gothic-title text-5xl md:text-6xl font-bold mb-6" style={{ color: '#8b2635' }}>
            SURVIVORS
          </h1>
          
          <p className="text-xl mb-8 italic" style={{ color: '#d9d1c5', fontFamily: 'Crimson Text, serif' }}>
            Survive the endless waves of darkness...
          </p>
          
          <div className="gothic-divider mb-8 w-full" />
          
          <div className="gothic-panel rounded-lg p-6 mb-8">
            <div className="space-y-3 text-base" style={{ color: '#d9d1c5' }}>
              <p><span style={{ color: '#c9a23f' }}>WASD</span> or <span style={{ color: '#c9a23f' }}>Arrow Keys</span> to move</p>
              <p style={{ color: '#8b8b8b' }}>Weapons fire automatically</p>
              <p><span style={{ color: '#c9a23f' }}>M</span> Toggle sound | <span style={{ color: '#c9a23f' }}>ESC</span> Pause | <span style={{ color: '#c9a23f' }}>R</span> Restart</p>
            </div>
            
            <div className="gothic-divider my-6" />
            
            <div className="space-y-2">
              <p style={{ color: '#7cb87c' }}>
                <span className="font-bold">Sylph Guardian</span> — Nature magic with flower turrets
              </p>
              <p style={{ color: '#9b7cb8' }}>
                <span className="font-bold">Shadow Assassin</span> — Fast & deadly with spider companions
              </p>
            </div>
          </div>

          <div className="gothic-panel rounded-lg p-4 mb-8" style={{ borderColor: '#5c1f2a' }}>
            <p className="font-bold text-lg" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>
              Boss Encounters Every 5 Waves
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b8b8b' }}>
              Defeat powerful bosses to earn bonus rewards
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {onShowUpgradeShop && (
              <button
                onClick={onShowUpgradeShop}
                className="gothic-button gothic-button-primary px-6 py-3 rounded-lg text-sm"
              >
                Upgrade Shop
              </button>
            )}
            {onShowStatistics && (
              <button
                onClick={onShowStatistics}
                className="gothic-button px-6 py-3 rounded-lg text-sm"
              >
                Statistics
              </button>
            )}
            {onShowSettings && (
              <button
                onClick={onShowSettings}
                className="gothic-button px-6 py-3 rounded-lg text-sm"
              >
                Settings
              </button>
            )}
          </div>

          <p className="text-sm animate-pulse" style={{ color: '#5c1f2a' }}>
            Press any key or click to begin your journey...
          </p>
          
          <div className="gothic-divider mt-8 w-full" />
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
      <div className="gothic-vignette" />
      <BossWarning />

      {isBossActive && <BossHealthBar />}

      <ComboDisplay combo={comboCount} multiplier={comboMultiplier} timeRemaining={3} />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <div className="gothic-bar p-4 rounded-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm" style={{ color: '#8b2635' }}>HP</span>
              <div className="w-32 h-3 rounded-full overflow-hidden" style={{ background: '#1b1a24', border: '1px solid #2b193d' }}>
                <div
                  className="h-full gothic-health-bar transition-all duration-200"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <span className="text-xs" style={{ color: '#d9d1c5' }}>{health}/{maxHealth}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm" style={{ color: '#c9a23f' }}>Score</span>
              <span className="text-lg font-bold" style={{ color: '#d9d1c5' }}>{score.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm" style={{ color: '#c9a23f' }}>Gold</span>
              <span className="text-sm font-bold" style={{ color: '#c9a23f' }}>{currency.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm" style={{ color: '#9b7cb8' }}>LVL</span>
              <span className="text-lg font-bold" style={{ color: '#d9d1c5' }}>{level}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm" style={{ color: '#5c1f2a' }}>Kills</span>
              <span className="text-sm" style={{ color: '#d9d1c5' }}>{totalKills}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-2">
            <span className="font-bold text-xs" style={{ color: '#4a9060' }}>EXP</span>
            <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: '#1b1a24', border: '1px solid #2b193d' }}>
              <div
                className="h-full gothic-xp-bar transition-all duration-200"
                style={{ width: `${experiencePercentage}%` }}
              />
            </div>
            <span className="text-xs" style={{ color: '#7cb87c' }}>{experience}/{experienceToNext}</span>
          </div>

          {isBossWave && !isBossActive && (
            <div className="mt-2 text-xs animate-pulse" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>
              Boss approaches... Prepare yourself!
            </div>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="gothic-button p-3 rounded-lg text-sm"
        >
          {isMuted ? "Muted" : "Sound"}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 gothic-bar p-2 rounded text-xs" style={{ color: '#8b8b8b' }}>
        <div>WASD/Arrows: Move | ESC: Pause | M: Sound | R: Restart</div>
      </div>

      <div className="absolute bottom-4 right-4 space-y-2">
        {isBossActive && (
          <div className="gothic-panel p-3 rounded-lg" style={{ borderColor: '#8b2635' }}>
            <div className="text-sm font-bold" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>BOSS FIGHT</div>
            <div className="text-xs mt-1" style={{ color: '#8b8b8b' }}>Defeat the boss to proceed!</div>
          </div>
        )}
        <Minimap playerX={0} playerY={0} enemies={[]} />
      </div>
    </div>
  );
}
