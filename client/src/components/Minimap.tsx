
import { useEffect, useRef } from "react";

interface MinimapProps {
  playerX: number;
  playerY: number;
  enemies: Array<{ x: number; y: number; type: string }>;
  size?: number;
}

export default function Minimap({ playerX, playerY, enemies, size = 150 }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);

    const scale = 0.1;
    const centerX = size / 2;
    const centerY = size / 2;

    enemies.forEach(enemy => {
      const relX = (enemy.x - playerX) * scale;
      const relY = (enemy.y - playerY) * scale;
      
      const mapX = centerX + relX;
      const mapY = centerY + relY;

      if (mapX >= 0 && mapX <= size && mapY >= 0 && mapY <= size) {
        ctx.fillStyle = enemy.type.includes("boss") ? "#ff0000" : "#ff6666";
        ctx.beginPath();
        ctx.arc(mapX, mapY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.stroke();

  }, [playerX, playerY, enemies, size]);

  return (
    <div className="absolute top-4 right-4 z-40">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border-2 border-gray-600 rounded"
      />
      <div className="text-xs text-white text-center mt-1 bg-black bg-opacity-70 rounded px-2">
        Minimap
      </div>
    </div>
  );
}
