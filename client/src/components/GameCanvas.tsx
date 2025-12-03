import { useEffect, useRef } from "react";
import { GameEngine } from "../lib/game/GameEngine";
import { useGameState } from "../state/gameState";

interface GameCanvasProps {
  onEngineReady?: (engine: GameEngine) => void;
}

export default function GameCanvas({ onEngineReady }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize game engine
    const ctx = canvas.getContext("2d");
    if (ctx) {
      gameEngineRef.current = new GameEngine(canvas, ctx);
      
      // Notify parent component that engine is ready
      if (onEngineReady) {
        onEngineReady(gameEngineRef.current);
      }
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  // Listen for game phase changes to start/stop the engine
  const phase = useGameState((state) => state.phase);
  const engine = gameEngineRef.current;

  useEffect(() => {
    if (phase === "playing" && engine) {
      // Setup player with selected character when starting
      const gameState = useGameState.getState();
      if (gameState.selectedCharacter) {
        // Extract character ID and setup player
        const characterId = typeof gameState.selectedCharacter === 'object' 
          ? gameState.selectedCharacter.id 
          : gameState.selectedCharacter;
        // Access the entity manager through the engine to setup player
        (engine as any).entityManager?.setupPlayer(characterId);
      }
      engine.start();
    }
  }, [phase, engine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}