import { useEffect, useRef } from "react";
import { GameEngine } from "../lib/game/GameEngine";
import { useGameState } from "../lib/stores/useGameState";

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
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (phase === "characterSelect") {
      // Reset the started flag when going back to character select (restart)
      hasStartedRef.current = false;
    } else if (phase === "playing" && engine) {
      // Setup player with selected character only on initial start, not on resume from pause
      const gameState = useGameState.getState();
      if (gameState.selectedCharacter && !hasStartedRef.current) {
        // Extract character ID and setup player
        const characterId = typeof gameState.selectedCharacter === 'object'
          ? gameState.selectedCharacter.id
          : gameState.selectedCharacter;
        // Access the entity manager through the engine to setup player
        (engine as any).entityManager?.setupPlayer(characterId);
        hasStartedRef.current = true;
      }
      engine.start();
    } else if (phase !== "playing" && engine) {
      engine.stop();
    }
  }, [phase, engine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
