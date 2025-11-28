import { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import PowerUpSelection from "./PowerUpSelection";
import CharacterSelection from "./CharacterSelection";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { CharacterType } from "./CharacterSelection";
import PauseMenu from "./PauseMenu";
import SettingsMenu from "./SettingsMenu";
import { GameEngine } from "../lib/game/GameEngine";
import GameOverScreen from "./GameOverScreen";
import StatisticsScreen from "./StatisticsScreen";
import LevelUpEffect from "./LevelUpEffect";
import UpgradeShop from "./UpgradeShop";
import DebugTestingScreen from "./DebugTestingScreen";
import MainMenu from "./MainMenu";

export default function Game() {
  const { phase, restart, resumeFromLevelUp, selectCharacter, resume } = useGameState();
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute } = useAudio();
  const audioInitialized = useRef(false);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showUpgradeShop, setShowUpgradeShop] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      if (audioInitialized.current) return;
      audioInitialized.current = true;
      console.log("Audio system initialized (files optional)");
    };

    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    const handleDebugKey = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    document.addEventListener("keydown", handleDebugKey);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("keydown", handleDebugKey);
    };
  }, []);

  const handlePowerUpSelect = (powerUp: any) => {
    if (engine?.getPlayer && powerUp.apply) {
      powerUp.apply(engine.getPlayer());
    }
    resumeFromLevelUp();
  };

  const handleCharacterSelect = (character: CharacterType) => {
    selectCharacter(character);
  };

  if (phase === "ready") {
    return (
      <div className="relative w-full h-full">
        <MainMenu />
      </div>
    );
  }

  if (phase === "gameOver" || phase === "ended") {
    return (
      <div className="relative w-full h-full">
        <GameOverScreen />
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

  if (showStatistics) {
    return (
      <StatisticsScreen onClose={() => setShowStatistics(false)} />
    );
  }

  if (showUpgradeShop) {
    return (
      <UpgradeShop onClose={() => setShowUpgradeShop(false)} />
    );
  }

  if (showDebug) {
    return (
      <DebugTestingScreen onClose={() => setShowDebug(false)} />
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <GameCanvas onEngineReady={setEngine} />
      <GameUI 
        onShowUpgradeShop={() => setShowUpgradeShop(true)}
        onShowStatistics={() => setShowStatistics(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowDebug={() => setShowDebug(true)}
      />
      <LevelUpEffect />

      {phase === "paused" && !showSettings && (
        <PauseMenu
          onShowSettings={() => setShowSettings(true)}
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
