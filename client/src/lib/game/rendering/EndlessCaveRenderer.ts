import { SpriteManager } from "./SpriteManager";

export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class EndlessCaveRenderer {
  private tileSize = 16;
  private spriteManager: SpriteManager;
  private spriteLoaded = false;
  private srcTileSize = 16; // Source tile size in the Ground_rocks.png (16x16)
  private srcTileHeight = 16; // Source tile height

  // Tile connection types for seamless blending (16x16 grid)
  private static readonly TILE_VARIANTS = {
    CENTER: { x: 0, y: 0 }, // Center tile (default)
    EDGE_TOP: { x: 16, y: 0 }, // Top edge
    EDGE_RIGHT: { x: 32, y: 0 }, // Right edge
    EDGE_BOTTOM: { x: 48, y: 0 }, // Bottom edge
    EDGE_LEFT: { x: 64, y: 0 }, // Left edge
    CORNER_TL: { x: 0, y: 16 }, // Top-left corner
    CORNER_TR: { x: 16, y: 16 }, // Top-right corner
    CORNER_BR: { x: 32, y: 16 }, // Bottom-right corner
    CORNER_BL: { x: 48, y: 16 }, // Bottom-left corner
  };

  constructor() {
    this.spriteManager = SpriteManager.getInstance();
    this.loadGroundSprite();
  }

  private async loadGroundSprite(): Promise<void> {
    try {
      await this.spriteManager.loadSprite(
        "ground_rocks",
        "/assets/tilesets/PNG/Ground_rocks.png",
      );
      this.spriteLoaded = true;
      console.log("Ground rocks tileset loaded successfully");
    } catch (error) {
      console.warn("Failed to load ground rocks tileset:", error);
      this.spriteLoaded = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Calculate visible tile range
    const startTileX = Math.floor(camera.x / this.tileSize);
    const endTileX = Math.ceil((camera.x + camera.width) / this.tileSize);
    const startTileY = Math.floor(camera.y / this.tileSize);
    const endTileY = Math.ceil((camera.y + camera.height) / this.tileSize);

    if (!this.spriteLoaded) {
      this.renderFallback(
        ctx,
        startTileX,
        endTileX,
        startTileY,
        endTileY,
        camera,
      );
      return;
    }

    const groundSprite = this.spriteManager.getSprite("ground_rocks");
    if (!groundSprite) {
      this.renderFallback(
        ctx,
        startTileX,
        endTileX,
        startTileY,
        endTileY,
        camera,
      );
      return;
    }

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = false; // Disable smoothing for pixel-perfect tiles
    ctx.imageSmoothingQuality = "low";

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const screenX = tileX * this.tileSize - camera.x;
        const screenY = tileY * this.tileSize - camera.y;

        // Use a seamless textured ground tile from the tileset
        ctx.drawImage(
          groundSprite,
          160, 80, this.srcTileSize, this.srcTileHeight, // Source: textured ground tile
          screenX, screenY, this.tileSize, this.tileSize // Destination
        );
      }
    }
  }

  private renderFallback(
    ctx: CanvasRenderingContext2D,
    startTileX: number,
    endTileX: number,
    startTileY: number,
    endTileY: number,
    camera: { x: number; y: number },
  ): void {
    // Fallback to grey colors if sprite fails to load
    const greyColor = "#666666";
    const darkGreyColor = "#555555";

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const screenX = tileX * this.tileSize - camera.x;
        const screenY = tileY * this.tileSize - camera.y;

        const isAlternate = (tileX + tileY) % 2 === 0;
        ctx.fillStyle = isAlternate ? greyColor : darkGreyColor;
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
      }
    }
  }

  private getTileVariant(
    tileX: number,
    tileY: number,
  ): { x: number; y: number } {
    // Create a pattern for tile edges and corners
    // This creates natural-looking variation by using different tile types
    // based on position to simulate edge detection

    const noise = (tileX * 7 + tileY * 11) % 16;

    // Create edge patterns every few tiles for natural variation
    const isEdgeX = tileX % 8 === 0 || tileX % 8 === 7;
    const isEdgeY = tileY % 8 === 0 || tileY % 8 === 7;
    const isCorner = isEdgeX && isEdgeY;

    if (isCorner) {
      // Use corner variants for corners
      if (tileX % 8 === 0 && tileY % 8 === 0)
        return EndlessCaveRenderer.TILE_VARIANTS.CORNER_TL;
      if (tileX % 8 === 7 && tileY % 8 === 0)
        return EndlessCaveRenderer.TILE_VARIANTS.CORNER_TR;
      if (tileX % 8 === 7 && tileY % 8 === 7)
        return EndlessCaveRenderer.TILE_VARIANTS.CORNER_BR;
      if (tileX % 8 === 0 && tileY % 8 === 7)
        return EndlessCaveRenderer.TILE_VARIANTS.CORNER_BL;
    } else if (isEdgeX) {
      // Use left/right edge variants
      return tileX % 8 === 0
        ? EndlessCaveRenderer.TILE_VARIANTS.EDGE_LEFT
        : EndlessCaveRenderer.TILE_VARIANTS.EDGE_RIGHT;
    } else if (isEdgeY) {
      // Use top/bottom edge variants
      return tileY % 8 === 0
        ? EndlessCaveRenderer.TILE_VARIANTS.EDGE_TOP
        : EndlessCaveRenderer.TILE_VARIANTS.EDGE_BOTTOM;
    }

    // For most tiles, use center variant with occasional variation
    return noise < 2
      ? EndlessCaveRenderer.TILE_VARIANTS.EDGE_TOP
      : EndlessCaveRenderer.TILE_VARIANTS.CENTER;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public cleanupChunks(camera: Camera): void {
    // No chunks to cleanup for simple renderer
  }
}