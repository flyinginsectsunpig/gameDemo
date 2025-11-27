import { useEffect, useRef } from "react";

interface MinimapProps {
  playerX: number;
  playerY: number;
  enemies: Array<{ x: number; y: number; isBoss?: boolean }>;
}

export default function Minimap({ playerX, playerY, enemies }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background with gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#4444ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw range circles
    ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
    ctx.lineWidth = 1;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    [30, 60].forEach(radius => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw enemies
    const scale = 0.08;
    enemies.forEach((enemy) => {
      const dx = (enemy.x - playerX) * scale;
      const dy = (enemy.y - playerY) * scale;
      const enemyX = centerX + dx;
      const enemyY = centerY + dy;

      if (
        enemyX >= 0 &&
        enemyX <= canvas.width &&
        enemyY >= 0 &&
        enemyY <= canvas.height
      ) {
        if (enemy.isBoss) {
          // Boss enemies are larger and pulsing
          ctx.fillStyle = "#ff0000";
          ctx.shadowColor = "#ff0000";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(enemyX, enemyY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Regular enemies
          ctx.fillStyle = "#ff4444";
          ctx.beginPath();
          ctx.arc(enemyX, enemyY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw player (center) with glow
    ctx.fillStyle = "#00ff00";
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw direction indicator
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX, centerY - 10);
    ctx.stroke();
  }, [playerX, playerY, enemies]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        className="border-2 border-blue-500 rounded-lg shadow-lg"
      />
      <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        {enemies.length}
      </div>
    </div>
  );
}