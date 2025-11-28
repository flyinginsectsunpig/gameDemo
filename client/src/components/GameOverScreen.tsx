
import { useGameState } from "../lib/stores/useGameState";

export default function GameOverScreen() {
  const { phase, score, level, wave, maxCombo, totalKills, bossesDefeated, restart } = useGameState();

  if (phase !== "gameOver") return null;

  const handleRestart = () => {
    restart();
  };

  const handleMainMenu = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn" style={{ background: 'linear-gradient(180deg, rgba(10, 6, 8, 0.95) 0%, rgba(18, 9, 18, 0.98) 100%)' }}>
      <div className="gothic-vignette" />
      <div className="gothic-panel p-8 rounded-lg max-w-2xl w-full mx-4 relative z-10">
        <div className="gothic-divider mb-6" />
        
        <h1 className="gothic-title text-5xl font-bold text-center mb-8" style={{ color: '#8b2635' }}>
          GAME OVER
        </h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Final Score</div>
            <div className="text-2xl font-bold" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>{score.toLocaleString()}</div>
          </div>
          
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Level Reached</div>
            <div className="text-2xl font-bold" style={{ color: '#9b7cb8', fontFamily: 'Cinzel, serif' }}>{level}</div>
          </div>
          
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Wave Survived</div>
            <div className="text-2xl font-bold" style={{ color: '#7cb87c', fontFamily: 'Cinzel, serif' }}>{wave}</div>
          </div>
          
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Max Combo</div>
            <div className="text-2xl font-bold" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>{maxCombo}x</div>
          </div>
          
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Total Kills</div>
            <div className="text-2xl font-bold" style={{ color: '#8b2635', fontFamily: 'Cinzel, serif' }}>{totalKills}</div>
          </div>
          
          <div className="gothic-panel p-4 rounded-lg" style={{ borderColor: '#2b193d' }}>
            <div className="text-xs uppercase mb-1" style={{ color: '#5c5c5c', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Bosses Defeated</div>
            <div className="text-2xl font-bold" style={{ color: '#c9a23f', fontFamily: 'Cinzel, serif' }}>{bossesDefeated}</div>
          </div>
        </div>

        <div className="gothic-divider mb-6" />

        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="gothic-button gothic-button-primary w-full px-6 py-3 rounded-lg text-sm"
          >
            Try Again
          </button>
          <button
            onClick={handleMainMenu}
            className="gothic-button w-full px-6 py-3 rounded-lg text-sm"
          >
            Main Menu
          </button>
        </div>
        
        <div className="gothic-divider mt-6" />
      </div>
    </div>
  );
}
