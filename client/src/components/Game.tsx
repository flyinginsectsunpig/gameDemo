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

export default function Game() {
  const { phase, restart, resumeFromLevelUp, selectCharacter, resume, pause, playerStats, setPlayerStats } = useGameState();
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute } = useAudio();
  const audioInitialized = useRef(false);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false); // State for statistics screen

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (audioInitialized.current) return;

      try {
        // Load background music
        const bgMusic = new Audio("/sounds/background.mp3");
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        setBackgroundMusic(bgMusic);

        // Load sound effects
        const hitSound = new Audio("/sounds/hit.mp3");
        hitSound.volume = 0.5;
        setHitSound(hitSound);

        const successSound = new Audio("/sounds/success.mp3");
        successSound.volume = 0.7;
        setSuccessSound(successSound);

        audioInitialized.current = true;
        console.log("Audio initialized");
      } catch (error) {
        console.warn("Audio initialization failed:", error);
      }
    };

    const handleFirstInteraction = () => {
      initAudio();
      // Start unmuted after first interaction
      toggleMute();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, toggleMute]);

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
        />
      )}

      {showSettings && (
        <SettingsMenu onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}