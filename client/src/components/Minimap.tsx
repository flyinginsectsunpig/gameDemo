import { useEffect, useRef } from "react";

interface MinimapProps {
  playerX: number;
  playerY: number;
  enemies: Array<{ x: number; y: number; isBoss?: boolean }>;
}

export default function Minimap({ playerX, playerY, enemies }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 150;
  const viewRange = 800;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, size, size);

    // Border
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);

    // Center (player)
    const centerX = size / 2;
    const centerY = size / 2;

    // Draw player
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw enemies
    enemies.forEach((enemy) => {
      const dx = enemy.x - playerX;
      const dy = enemy.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < viewRange) {
        const scale = size / (viewRange * 2);
        const ex = centerX + dx * scale;
        const ey = centerY + dy * scale;

        ctx.fillStyle = enemy.isBoss ? "#ff0000" : "#ff6600";
        ctx.beginPath();
        ctx.arc(ex, ey, enemy.isBoss ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw range circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [playerX, playerY, enemies]);

  return (
    <div className="bg-black bg-opacity-80 rounded-lg p-2 border border-gray-600">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
      />
      <div className="text-xs text-gray-400 text-center mt-1">Minimap</div>
    </div>
  );
}