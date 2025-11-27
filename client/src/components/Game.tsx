import { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import PowerUpSelection from "./PowerUpSelection";
import CharacterSelection from "./CharacterSelection";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { PowerUpDefinition } from "../lib/game/PowerUp";
import { CharacterType } from "./CharacterSelection";
import PauseMenu from "./PauseMenu";
import SettingsMenu from "./SettingsMenu";
import { GameEngine } from "../lib/game/GameEngine";
import GameOverScreen from "./GameOverScreen";
import StatisticsScreen from "./StatisticsScreen";
import LevelUpEffect from "./LevelUpEffect";
import UpgradeShop from "./UpgradeShop";

export default function Game() {
  const { phase, restart, resumeFromLevelUp, selectCharacter, resume, pause, playerStats, setPlayerStats } = useGameState();
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute } = useAudio();
  const audioInitialized = useRef(false);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showUpgradeShop, setShowUpgradeShop] = useState(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (audioInitialized.current) return;

      // Audio is now optional - game works without it
      audioInitialized.current = true;
      console.log("Audio system initialized (files optional)");
    };

    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const handlePowerUpSelect = (powerUp: PowerUpDefinition) => {
    if (engine?.getPlayer) {
      powerUp.apply(engine.getPlayer());
    }
    resumeFromLevelUp();
  };

  const handleCharacterSelect = (character: CharacterType) => {
    selectCharacter(character);
  };

  // Game Over logic - This is where the Game Over screen would be rendered.
  // The original code already had a conditional render for "ended" phase.
  // We'll keep that and ensure it displays the GameOverScreen component.
  if (phase === "ended") {
    return (
      <div className="relative w-full h-full">
        <GameOverScreen onRestart={restart} />
      </div>
    );
  }

  if (phase === "levelUp") {
    return (
      <div className="relative w-full h-full">
        <GameCanvas onEngineReady={setEngine} />
        <PowerUpSelection
          onSelect={handlePowerUpSelect}
          onClose={resumeFromLevelUp}
        />
      </div>
    );
  }

  if (phase === "characterSelect") {
    return (
      <div className="relative w-full h-full">
        <CharacterSelection onSelect={handleCharacterSelect} onClose={resumeFromLevelUp} />
      </div>
    );
  }

  // Statistics screen display
  if (showStatistics) {
    return (
      <StatisticsScreen stats={playerStats} onClose={() => setShowStatistics(false)} />
    );
  }

  // Upgrade shop display
  if (showUpgradeShop) {
    return (
      <UpgradeShop onClose={() => setShowUpgradeShop(false)} />
    );
  }


  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <GameCanvas onEngineReady={setEngine} />
      <GameUI />
      <LevelUpEffect />

      {phase === "levelUp" && (
        <PowerUpSelection
          onSelect={handlePowerUpSelect}
          onClose={() => {}}
        />
      )}

      {phase === "characterSelect" && (
        <CharacterSelection
          onSelect={handleCharacterSelect}
          onClose={() => {}}
        />
      )}

      {phase === "paused" && !showSettings && (
        <PauseMenu
          onResume={resume}
          onRestart={() => {
            restart();
            resume();
          }}
          onSettings={() => setShowSettings(true)}
          onShowStatistics={() => setShowStatistics(true)}
          onShowUpgradeShop={() => setShowUpgradeShop(true)}
        />
      )}

      {showSettings && (
        <SettingsMenu onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}