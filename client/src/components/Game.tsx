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
import { StatisticsSystem } from "../lib/game/systems/StatisticsSystem";

type ModalSource = "mainMenu" | "pauseMenu" | "gameplay" | null;

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
  const [modalSource, setModalSource] = useState<ModalSource>(null);

  // Recover any orphaned session from a previous crash/refresh
  useEffect(() => {
    const recovered = StatisticsSystem.recoverOrphanedSession();
    if (recovered) {
      console.log('[Game] Recovered orphaned session from previous run');
    }
  }, []);

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
        const gameState = useGameState.getState();
        setShowDebug(prev => {
          if (!prev) {
            if (gameState.phase === "ready") {
              setModalSource("mainMenu");
            } else if (gameState.phase === "paused") {
              setModalSource("pauseMenu");
            } else if (gameState.phase === "playing") {
              setModalSource("gameplay");
            }
          }
          return !prev;
        });
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

  const handleCloseModal = () => {
    setShowStatistics(false);
    setShowUpgradeShop(false);
    setShowSettings(false);
    setShowDebug(false);
    setModalSource(null);
  };

  const openFromMainMenu = (modalType: "statistics" | "shop" | "settings" | "debug") => {
    setModalSource("mainMenu");
    if (modalType === "statistics") setShowStatistics(true);
    if (modalType === "shop") setShowUpgradeShop(true);
    if (modalType === "settings") setShowSettings(true);
    if (modalType === "debug") setShowDebug(true);
  };

  const openFromPauseMenu = (modalType: "statistics" | "shop" | "settings") => {
    setModalSource("pauseMenu");
    if (modalType === "statistics") setShowStatistics(true);
    if (modalType === "shop") setShowUpgradeShop(true);
    if (modalType === "settings") setShowSettings(true);
  };

  if (showStatistics) {
    return (
      <StatisticsScreen onClose={handleCloseModal} />
    );
  }

  if (showUpgradeShop) {
    return (
      <UpgradeShop onClose={handleCloseModal} />
    );
  }

  if (showDebug) {
    return (
      <DebugTestingScreen onClose={handleCloseModal} />
    );
  }

  if (showSettings) {
    return (
      <SettingsMenu onClose={handleCloseModal} />
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

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <GameCanvas onEngineReady={setEngine} />
      <GameUI 
        onShowUpgradeShop={() => openFromMainMenu("shop")}
        onShowStatistics={() => openFromMainMenu("statistics")}
        onShowSettings={() => openFromMainMenu("settings")}
        onShowDebug={() => openFromMainMenu("debug")}
      />
      <LevelUpEffect />

      {phase === "paused" && (
        <PauseMenu
          onShowSettings={() => openFromPauseMenu("settings")}
          onShowStatistics={() => openFromPauseMenu("statistics")}
          onShowUpgradeShop={() => openFromPauseMenu("shop")}
        />
      )}
    </div>
  );
}
