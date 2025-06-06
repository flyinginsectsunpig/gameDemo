import { useEffect, useRef } from "react";
import { GameEngine } from "../lib/game/GameEngine";

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
      gameEngineRef.current.start();
      
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
