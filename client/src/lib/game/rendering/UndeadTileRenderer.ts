import { SpriteManager } from './SpriteManager';
import { TileMapGenerator, TileMapCell } from '../managers/TileMapGenerator';

export class UndeadTileRenderer {
  private spriteManager: SpriteManager;
  private tileSize: number = 64;
  private map: TileMapCell[][];

  constructor() {
    this.spriteManager = SpriteManager.getInstance();
    this.map = TileMapGenerator.generateUndeadScene();
  }

  public async loadUndeadSprites(): Promise<void> {
    const spritePromises = [
      this.spriteManager.loadSprite('undead_ground', `/Tileset/PNG/Ground_new.png?v=${Date.now()}&r=${Math.random()}&force=true`),
      this.spriteManager.loadSprite('undead_objects', '/craftpix-net-695666-free-undead-tileset-top-down-pixel-art/PNG/Objects.png'),
      this.spriteManager.loadSprite('undead_details', '/craftpix-net-695666-free-undead-tileset-top-down-pixel-art/PNG/Details.png'),
    ];

    try {
      await Promise.all(spritePromises);
      console.log('Undead tileset sprites loaded successfully');
    } catch (error) {
      console.warn('Some undead sprites failed to load:', error);
    }
  }

  public drawUndeadScene(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    const groundSprite = this.spriteManager.getSprite('undead_ground');
    const objectsSprite = this.spriteManager.getSprite('undead_objects');
    const detailsSprite = this.spriteManager.getSprite('undead_details');

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const srcTileSize = 256; // Source tile size in the new tileset (256x256 pixels)

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cell = this.map[y][x];
        const drawX = offsetX + x * this.tileSize;
        const drawY = offsetY + y * this.tileSize;

        // Draw ground layer using new tileset coordinates
        if (groundSprite) {
          this.drawTileFromCoords(ctx, groundSprite, cell.groundTile, drawX, drawY, srcTileSize);
        } else {
          // Fallback to colored rectangles with undead theme
          this.drawFallbackTile(ctx, cell.groundTile, drawX, drawY, 'ground');
        }

        // Draw object layer
        if (cell.objectTile !== undefined) {
          if (objectsSprite) {
            this.drawTile(ctx, objectsSprite, cell.objectTile, drawX, drawY, srcTileSize);
          } else {
            this.drawFallbackTile(ctx, cell.objectTile, drawX, drawY, 'object');
          }
        }

        // Draw detail layer
        if (cell.detailTile !== undefined) {
          if (detailsSprite) {
            this.drawTile(ctx, detailsSprite, cell.detailTile, drawX, drawY, srcTileSize);
          } else {
            this.drawFallbackTile(ctx, cell.detailTile, drawX, drawY, 'detail');
          }
        }
      }
    }

    // Add atmospheric fog overlay
    this.drawFogOverlay(ctx, offsetX, offsetY);
  }

  private drawTile(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, tileIndex: number, x: number, y: number, srcTileSize: number): void {
    const tilesPerRow = Math.floor(sprite.width / srcTileSize);
    const srcX = (tileIndex % tilesPerRow) * srcTileSize;
    const srcY = Math.floor(tileIndex / tilesPerRow) * srcTileSize;

    ctx.drawImage(
      sprite,
      srcX, srcY, srcTileSize, srcTileSize,
      x, y, this.tileSize, this.tileSize
    );
  }

  // New method to draw tiles using direct pixel coordinates from the tileset mapping
  private drawTileFromCoords(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, tileIndex: number, x: number, y: number, srcTileSize: number): void {
    // Always use the first tile (top-left) as the ground tile
    const srcX = 0;
    const srcY = 0;
    
    ctx.drawImage(
      sprite,
      srcX, srcY, srcTileSize, srcTileSize,
      x, y, this.tileSize, this.tileSize
    );
  }

  private drawFallbackTile(ctx: CanvasRenderingContext2D, tileIndex: number, x: number, y: number, layer: 'ground' | 'object' | 'detail'): void {
    let color = '#2a1f15'; // Default dark earth

    if (layer === 'ground') {
      const groundColors = ['#2a1f15', '#3d2f1f', '#1e2a1e', '#4a3a2a', '#2f2520', '#5a4a35', '#332922', '#453525'];
      color = groundColors[tileIndex % groundColors.length];
    } else if (layer === 'object') {
      const objectColors = ['#8b4513', '#654321', '#3e2723', '#5d4037', '#4e342e', '#6d4c41', '#795548', '#a0522d'];
      color = objectColors[tileIndex % objectColors.length];
    } else {
      const detailColors = ['#faf0e6', '#deb887', '#f5deb3', '#cd853f', '#228b22', '#8fbc8f', '#9acd32', '#e6e6fa'];
      color = detailColors[tileIndex % detailColors.length];
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Add simple visual indicators for fallback
    if (layer === 'object') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    } else if (layer === 'detail') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x + 8, y + 8, this.tileSize - 16, this.tileSize - 16);
    }
  }

  private drawFogOverlay(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    // Create subtle fog effect
    const gradient = ctx.createRadialGradient(
      offsetX + 8 * this.tileSize, offsetY + 8 * this.tileSize, 0,
      offsetX + 8 * this.tileSize, offsetY + 8 * this.tileSize, 12 * this.tileSize
    );

    gradient.addColorStop(0, 'rgba(180, 180, 200, 0.05)');
    gradient.addColorStop(0.5, 'rgba(160, 160, 180, 0.1)');
    gradient.addColorStop(1, 'rgba(140, 140, 160, 0.15)');

    ctx.fillStyle = gradient;
    ctx.fillRect(offsetX, offsetY, 16 * this.tileSize, 16 * this.tileSize);
  }

  public getMapAsString(): string {
    return TileMapGenerator.exportAsGrid(this.map);
  }

  public regenerateMap(): void {
    this.map = TileMapGenerator.generateUndeadScene();
  }
}