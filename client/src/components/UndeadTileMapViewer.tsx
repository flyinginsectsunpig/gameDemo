import React, { useEffect, useRef, useState } from 'react';
import { UndeadTileRenderer } from '../lib/game/rendering/UndeadTileRenderer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function UndeadTileMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<UndeadTileRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapString, setMapString] = useState<string>('');

  useEffect(() => {
    const initRenderer = async () => {
      const tileRenderer = new UndeadTileRenderer();
      await tileRenderer.loadUndeadSprites();
      setRenderer(tileRenderer);
      setMapString(tileRenderer.getMapAsString());
      setIsLoading(false);
    };

    initRenderer();
  }, []);

  useEffect(() => {
    if (renderer && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the undead scene centered
      const offsetX = (canvas.width - 16 * 32) / 2;
      const offsetY = (canvas.height - 16 * 32) / 2;

      renderer.drawUndeadScene(ctx, offsetX, offsetY);
    }
  }, [renderer]);

  const regenerateMap = () => {
    if (renderer && canvasRef.current) {
      renderer.regenerateMap();
      setMapString(renderer.getMapAsString());

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const offsetX = (canvas.width - 16 * 32) / 2;
      const offsetY = (canvas.height - 16 * 32) / 2;

      renderer.drawUndeadScene(ctx, offsetX, offsetY);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading undead tileset...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🧟 Undead Tileset Scene (16×16) 🏴‍☠️
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="border border-gray-600 rounded-lg bg-gray-900"
            style={{ imageRendering: 'pixelated' }}
          />
          <Button onClick={regenerateMap} className="mt-4">
            Generate New Scene
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map Grid Export</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-96 font-mono">
            {mapString}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}