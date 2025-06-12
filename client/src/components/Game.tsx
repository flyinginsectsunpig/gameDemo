import { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import PowerUpSelection from "./PowerUpSelection";
import CharacterSelection from "./CharacterSelection";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { PowerUpDefinition } from "../lib/game/PowerUp";
import { CharacterType } from "./CharacterSelection";

export default function Game() {
  const { phase, restart, resumeFromLevelUp, selectCharacter } = useGameState();
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute } = useAudio();
  const audioInitialized = useRef(false);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  if (phase === "ended") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-red-500">GAME OVER</h1>
          <p className="text-xl mb-8">You survived as long as you could!</p>
          <button
            onClick={restart}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            Play Again
          </button>
          <p className="text-sm mt-4 text-gray-400">Press R to restart anytime</p>
        </div>
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
      <GameUI />
    </div>
  );
}