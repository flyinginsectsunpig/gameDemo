import { SpriteManager } from './SpriteManager';
import { useGameState } from '../../stores/useGameState';

export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlowerTile {
  tileX: number;
  tileY: number;
  age: number;
  maxAge: number;
  bloomStage: number;
  lastShot: number;
  shotCooldown: number;
  shotsRemaining: number;
  id: number;
}

export interface SylphOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  age: number;
  targetEnemyId?: number;
  homingSpeed: number;
  damage: number;
  phase: 'rising' | 'homing';
  riseStartY: number;
  riseTargetY: number;
  riseProgress: number;
  targetX?: number;
  targetY?: number;
}

// Spider entity interface
export interface SpiderEntity {
    x: number;
    y: number;
    instanceId?: string;
    currentAnimation?: string;
    lastDirection?: any;
    previousScreenX?: number;
    previousScreenY?: number;
    frameCounter?: number;
}

export class InfiniteTileRenderer {
  private spriteManager: SpriteManager;
  private tileSize = 32;
  private srcTileSize = 256; // Source tile size in Ground_new.png (256x256 pixels)
  private tilesPerRow = 4; // 4 tiles across in Ground_new.png
  private chunkSize = 32; // 32x32 tiles per chunk
  private loadedChunks = new Map<string, number[][]>();
  private spriteLoaded = false;

  // Flower management as part of tile system
  private flowers = new Map<string, FlowerTile>(); // Key: "tileX,tileY"
  private flowerTiles: HTMLImageElement[] = [];
  private flowersLoaded = false;
  private nextFlowerId = 0;

  // Orb management as part of tile system
  private orbs: SylphOrb[] = [];

  // Spider management as part of tile system
  private spiders: SpiderEntity[] = [];
  private lastSpiderRender = 0;

  // Ground tile types using different tiles from the 4x4 grid in Ground_new.png
  private static readonly GROUND_TILES = {
    GRASS_1: 0,      // Top-left grass
    GRASS_2: 1,      // Top-middle grass  
    GRASS_3: 2,      // Top-right grass
    GRASS_4: 3,      // Top-far-right grass
    DIRT_1: 4,       // Second row, left dirt
    DIRT_2: 5,       // Second row, middle dirt
    DIRT_3: 6,       // Second row, right dirt
    DIRT_4: 7,       // Second row, far-right dirt
    STONE_1: 8,      // Third row, left stone
    STONE_2: 9,      // Third row, middle stone
    STONE_3: 10,     // Third row, right stone
    STONE_4: 11,     // Third row, far-right stone
    DARK_1: 12,      // Bottom row, left dark
    DARK_2: 13,      // Bottom row, middle dark
    DARK_3: 14,      // Bottom row, right dark
    DARK_4: 15,      // Bottom row, far-right dark
  };

  constructor() {
    this.spriteManager = SpriteManager.getInstance();
    this.loadUndeadSprite();
    this.loadFlowerSprites();
  }

  private async loadUndeadSprite(): Promise<void> {
    try {
      await this.spriteManager.loadSprite(
        'undead_tileset', 
        '/assets/tilesets/PNG/Ground_new.png'
      );
      this.spriteLoaded = true;
      console.log('Undead tileset loaded successfully');
    } catch (error) {
      console.warn('Failed to load undead tileset:', error);
      this.spriteLoaded = false;
    }
  }

  private async loadFlowerSprites(): Promise<void> {
    try {
      const spritesheet = new Image();
      spritesheet.src = '/assets/sprites/flower_growing.png';
      await new Promise((resolve, reject) => {
        spritesheet.onload = resolve;
        spritesheet.onerror = reject;
      });

      const frameWidth = spritesheet.width / 6;
      const frameHeight = spritesheet.height;

      // Create 6 individual flower tile images - much larger than tiles
      for (let i = 0; i < 6; i++) {
        const flowerSize = this.tileSize * 3; // Make flowers 3x larger than tiles
        const canvas = document.createElement('canvas');
        canvas.width = flowerSize;
        canvas.height = flowerSize;
        const ctx = canvas.getContext('2d')!;

        // Calculate scale to fit the flower while maintaining aspect ratio
        // Use the smaller scale to ensure the entire flower fits
        const scaleX = flowerSize / frameWidth;
        const scaleY = flowerSize / frameHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // Slightly smaller to ensure no cropping

        const scaledWidth = frameWidth * scale;
        const scaledHeight = frameHeight * scale;

        // Center the flower in the canvas
        const offsetX = (flowerSize - scaledWidth) / 2;
        const offsetY = (flowerSize - scaledHeight) / 2;

        ctx.drawImage(
          spritesheet,
          i * frameWidth, 0,
          frameWidth, frameHeight,
          offsetX, offsetY,
          scaledWidth, scaledHeight
        );

        const tileImg = new Image();
        tileImg.src = canvas.toDataURL();
        this.flowerTiles.push(tileImg);
      }

      this.flowersLoaded = true;
      console.log('Flower sprites loaded and integrated into tile system');
    } catch (error) {
      console.warn('Failed to load flower sprites:', error);
    }
  }

  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  private generateChunk(chunkX: number, chunkY: number): number[][] {
    const chunk: number[][] = [];

    for (let y = 0; y < this.chunkSize; y++) {
      chunk[y] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        const worldX = chunkX * this.chunkSize + x;
        const worldY = chunkY * this.chunkSize + y;
        chunk[y][x] = this.generateCleanTileAt(worldX, worldY);
      }
    }

    return chunk;
  }

  private generateCleanTileAt(worldX: number, worldY: number): number {
    // Create multiple noise layers for varied terrain
    const scale1 = 0.02; // Large regions
    const scale2 = 0.06; // Medium features  
    const scale3 = 0.12; // Fine details

    // Base terrain noise with better distribution
    const noise1 = Math.sin(worldX * scale1) * Math.cos(worldY * scale1);
    const noise2 = Math.sin(worldX * scale2 + 100) * Math.cos(worldY * scale2 + 100);
    const noise3 = Math.sin(worldX * scale3 + 200) * Math.cos(worldY * scale3 + 200);

    // Combine noises with different weights
    const terrainNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);

    // Add deterministic variation based on position
    const posVariation = ((worldX * 13 + worldY * 17) % 1000) / 1000.0;
    const finalNoise = terrainNoise + (posVariation - 0.5) * 0.3;

    // Additional noise layers for paths and stone
    const pathNoise = Math.sin(worldX * 0.03 + 300) * Math.cos(worldY * 0.03 + 300);
    const stoneNoise = Math.sin(worldX * 0.08 + 400) * Math.cos(worldY * 0.08 + 400);

    // Generate varied terrain with multiple tile types
    if (pathNoise > 0.75) {
      // Stone paths and rocky areas
      if (stoneNoise > 0.3) return InfiniteTileRenderer.GROUND_TILES.STONE_1;
      if (stoneNoise > 0.0) return InfiniteTileRenderer.GROUND_TILES.STONE_2;
      if (stoneNoise > -0.3) return InfiniteTileRenderer.GROUND_TILES.STONE_3;
      return InfiniteTileRenderer.GROUND_TILES.STONE_4;
    } else if (finalNoise > 0.4) {
      // Dark/corrupted areas
      if (finalNoise > 0.7) return InfiniteTileRenderer.GROUND_TILES.DARK_1;
      if (finalNoise > 0.5) return InfiniteTileRenderer.GROUND_TILES.DARK_2;
      return InfiniteTileRenderer.GROUND_TILES.DARK_3;
    } else if (finalNoise > 0.1) {
      // Dirt areas
      if (finalNoise > 0.3) return InfiniteTileRenderer.GROUND_TILES.DIRT_1;
      if (finalNoise > 0.2) return InfiniteTileRenderer.GROUND_TILES.DIRT_2;
      return InfiniteTileRenderer.GROUND_TILES.DIRT_3;
    } else if (finalNoise > -0.2) {
      // Grass areas
      if (finalNoise > 0.0) return InfiniteTileRenderer.GROUND_TILES.GRASS_1;
      if (finalNoise > -0.1) return InfiniteTileRenderer.GROUND_TILES.GRASS_2;
      return InfiniteTileRenderer.GROUND_TILES.GRASS_3;
    } else {
      // Base ground variation
      if (finalNoise > -0.4) return InfiniteTileRenderer.GROUND_TILES.GRASS_4;
      if (finalNoise > -0.6) return InfiniteTileRenderer.GROUND_TILES.DIRT_4;
      return InfiniteTileRenderer.GROUND_TILES.STONE_1;
    }
  }

  private getChunk(chunkX: number, chunkY: number): number[][] {
    const key = this.getChunkKey(chunkX, chunkY);
    if (!this.loadedChunks.has(key)) {
      this.loadedChunks.set(key, this.generateChunk(chunkX, chunkY));
    }
    return this.loadedChunks.get(key)!;
  }

  public getTileAt(worldX: number, worldY: number): number {
    const chunkX = Math.floor(worldX / this.chunkSize);
    const chunkY = Math.floor(worldY / this.chunkSize);
    const localX = worldX - chunkX * this.chunkSize;
    const localY = worldY - chunkY * this.chunkSize;

    const chunk = this.getChunk(chunkX, chunkY);
    return chunk[localY] ? chunk[localY][localX] || InfiniteTileRenderer.GROUND_TILES.GRASS_1 : InfiniteTileRenderer.GROUND_TILES.GRASS_1;
  }

  public isSolidAt(worldX: number, worldY: number): boolean {
    // All ground tiles are walkable - no solid tiles for basic terrain
    return false;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (!this.spriteLoaded) {
      this.renderFallback(ctx, camera);
      return;
    }

    const sprite = this.spriteManager.getSprite('undead_tileset');
    if (!sprite) {
      this.renderFallback(ctx, camera);
      return;
    }

    // Calculate visible tile range with buffer
    const buffer = 2;
    const startTileX = Math.floor(camera.x / this.tileSize) - buffer;
    const endTileX = Math.ceil((camera.x + camera.width) / this.tileSize) + buffer;
    const startTileY = Math.floor(camera.y / this.tileSize) - buffer;
    const endTileY = Math.ceil((camera.y + camera.height) / this.tileSize) + buffer;

    // Disable smoothing for pixel-perfect tiles
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';

    // Render visible ground tiles with variety
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tileId = this.getTileAt(tileX, tileY);
        const screenX = Math.floor(tileX * this.tileSize - camera.x);
        const screenY = Math.floor(tileY * this.tileSize - camera.y);

        // Draw base tile
        this.drawTile(ctx, sprite, tileId, screenX, screenY);
        
        // Add occasional detail tiles for variety (1 in 8 chance)
        const detailSeed = (tileX * 37 + tileY * 73) % 100;
        if (detailSeed < 12) {
          // Semi-transparent overlay for subtle variation
          ctx.globalAlpha = 0.3;
          const detailTile = (tileX + tileY) % 4;
          this.drawTile(ctx, sprite, detailTile, screenX, screenY);
          ctx.globalAlpha = 1.0;
        }

        // Render flower on this tile if it exists
        const flowerKey = `${tileX},${tileY}`;
        const flower = this.flowers.get(flowerKey);
        if (flower) {
          this.drawFlower(ctx, flower, screenX, screenY);
        }
      }
    }

    // Render spiders as background layer
    this.renderSpiders(ctx, camera);

    // Render flowers and orbs
    this.renderOrbs(ctx, camera);
  }

  private drawTile(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, tileId: number, x: number, y: number): void {
    // Calculate source coordinates based on tileId
    // Ground_new.png has a 4x4 grid of 256x256 tiles
    const tileRow = Math.floor(tileId / this.tilesPerRow);
    const tileCol = tileId % this.tilesPerRow;

    // Minimal cropping to preserve tile detail
    const cropMargin = 4; // Small crop to remove borders
    const srcX = cropMargin + (tileCol * this.srcTileSize);
    const srcY = cropMargin + (tileRow * this.srcTileSize);
    const actualTileSize = this.srcTileSize - (cropMargin * 2);

    // Render with slight overlap to prevent gaps
    const renderSize = this.tileSize + 2;
    const renderX = Math.floor(x) - 1;
    const renderY = Math.floor(y) - 1;

    ctx.drawImage(
      sprite,
      srcX, srcY, actualTileSize, actualTileSize,
      renderX, renderY, renderSize, renderSize
    );
  }

  private renderFallback(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const startTileX = Math.floor(camera.x / this.tileSize);
    const endTileX = Math.ceil((camera.x + camera.width) / this.tileSize);
    const startTileY = Math.floor(camera.y / this.tileSize);
    const endTileY = Math.ceil((camera.y + camera.height) / this.tileSize);

    // Fallback colors matching the new tile variety
    const getColorForTile = (tileId: number): string => {
      // Grass colors (0-3)
      if (tileId <= 3) return ['#4a5c2a', '#5a6b3a', '#3a4c1a', '#6a7b4a'][tileId];
      // Dirt colors (4-7)  
      if (tileId <= 7) return ['#8b7355', '#9b8365', '#7b6345', '#ab9375'][tileId - 4];
      // Stone colors (8-11)
      if (tileId <= 11) return ['#666666', '#777777', '#555555', '#888888'][tileId - 8];
      // Dark colors (12-15)
      return ['#2a2a2a', '#3a3a3a', '#1a1a1a', '#4a4a4a'][tileId - 12] || '#4a5c2a';
    };

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tileId = this.getTileAt(tileX, tileY);
        const screenX = tileX * this.tileSize - camera.x;
        const screenY = tileY * this.tileSize - camera.y;

        ctx.fillStyle = getColorForTile(tileId);
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
      }
    }
  }

  private drawFlower(ctx: CanvasRenderingContext2D, flower: FlowerTile, screenX: number, screenY: number): void {
    const flowerSize = this.tileSize * 3; // 3x larger than tiles

    if (!this.flowersLoaded || this.flowerTiles.length === 0) {
      // Fallback flower rendering - much larger and more visible
      ctx.save();
      const colors = ['#32cd32', '#90ee90', '#ff69b4', '#ff1493', '#9370db', '#4169e1'];
      ctx.fillStyle = colors[flower.bloomStage] || colors[0];

      const size = flowerSize * 0.6; // Large visible size
      const centerX = screenX + this.tileSize / 2;
      const centerY = screenY + this.tileSize / 2;

      // Draw flower with multiple petals for better visibility
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Add center
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    const frameIndex = Math.min(Math.max(flower.bloomStage, 0), 5);
    const flowerTile = this.flowerTiles[frameIndex];

    ctx.save();

    // Fade out in last 20% of life
    const ageRatio = flower.age / flower.maxAge;
    if (ageRatio > 0.8) {
      ctx.globalAlpha = (1 - ageRatio) / 0.2;
    }

    // Anchor flower to ground - center horizontally but align bottom with tile
    const offsetX = screenX - (flowerSize - this.tileSize) / 2;
    const offsetY = screenY - (flowerSize - this.tileSize); // Align bottom of flower with tile

    // Draw large flower centered on tile
    ctx.drawImage(
      flowerTile,
      0, 0,
      flowerSize, flowerSize,
      offsetX, offsetY,
      flowerSize, flowerSize
    );

    // Add sparkle effect for mature flowers
    if (flower.bloomStage >= 4) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) { // More sparkles for larger flowers
        const sparkleX = offsetX + Math.random() * flowerSize;
        const sparkleY = offsetY + Math.random() * flowerSize;
        const sparkleSize = 2 + Math.random() * 4; // Larger sparkles
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderOrbs(ctx: CanvasRenderingContext2D, camera: Camera): void {
    this.orbs.forEach((orb) => {
      const screenX = Math.floor(orb.x - camera.x);
      const screenY = Math.floor(orb.y - camera.y);

      // Expand culling bounds to account for full orb sprite size
      const maxRadius = orb.size * 3.0;
      if (
        screenX < -maxRadius ||
        screenX > camera.width + maxRadius ||
        screenY < -maxRadius ||
        screenY > camera.height + maxRadius
      ) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = orb.life;

      // Enhanced mystical orb rendering
      const time = Date.now() * 0.008;
      const orbLifeRatio = orb.age / orb.maxLife;
      const pulse = Math.sin(time + orb.age * 0.01) * 0.4 + 0.6;

      // Move to center position
      ctx.translate(screenX, screenY);

      // Smooth rotation based on movement direction
      const rotationSpeed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy) * 0.01;
      ctx.rotate(orb.age * rotationSpeed * 0.003);

      // Mystical outer glow
      ctx.shadowColor = orb.color;
      ctx.shadowBlur = 8 * pulse;

      // Draw flower petals with enhanced mystical effect
      const petalCount = 5;
      for (let i = 0; i < petalCount; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / petalCount);

        // Gradient petal effect
        const gradient = ctx.createRadialGradient(0, -orb.size * 0.3, 0, 0, -orb.size * 0.3, orb.size * 0.5);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(0.7, `${orb.color}80`); // Semi-transparent
        gradient.addColorStop(1, `${orb.color}20`); // Very transparent

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(
          0,
          -orb.size * 0.35,
          orb.size * 0.25,
          orb.size * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.restore();
      }

      // Pulsing core with gradient
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, orb.size * 0.3);
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(0.3, "#ffff88");
      coreGradient.addColorStop(1, orb.color);

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, orb.size * 0.2 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Reduced sparkle frequency from 0.15 to 0.05 for better performance
      if (Math.random() < 0.05 && orbLifeRatio < 0.8) {
        const sparkleAlpha = (1 - orbLifeRatio) * Math.random() * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        const sparkleDistance = orb.size * 0.8;
        const sparkleAngle = Math.random() * Math.PI * 2;
        const sparkleX = Math.cos(sparkleAngle) * sparkleDistance * Math.random();
        const sparkleY = Math.sin(sparkleAngle) * sparkleDistance * Math.random();
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 0.5 + Math.random() * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // New method to render spiders
  private renderSpiders(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Render spiders every frame for smooth animation (no throttling)
    
    this.spiders.forEach((spider) => {
      const screenX = Math.floor(spider.x - camera.x);
      const screenY = Math.floor(spider.y - camera.y);

      // Check if spider is within camera bounds
      const spiderHeight = this.tileSize * 1.5;
      const spiderWidth = spiderHeight * (800 / 450);
      if (
        screenX < -spiderWidth ||
        screenX > camera.width + spiderWidth ||
        screenY < -spiderHeight ||
        screenY > camera.height + spiderHeight
      ) {
        return;
      }

      this.drawSpider(ctx, spider, screenX, screenY);
    });
  }

  private drawSpider(ctx: CanvasRenderingContext2D, spider: any, screenX: number, screenY: number): void {
    const spiderHeight = this.tileSize * 1.5; // Height based on tile size
    const spiderWidth = spiderHeight * (800 / 450); // Maintain 800:450 aspect ratio

    ctx.save();
    
    // Store previous position for clearing
    if (!spider.previousScreenX) spider.previousScreenX = screenX;
    if (!spider.previousScreenY) spider.previousScreenY = screenY;
    
    // Remove clearRect to prevent black squares - canvas is cleared each frame by GameEngine
    
    // Update stored position
    spider.previousScreenX = screenX;
    spider.previousScreenY = screenY;

    // Get the appropriate sprite for current animation
    let spriteName = 'spider_down';
    if (spider.currentAnimation) {
      switch (spider.currentAnimation) {
        case 'spider_walk_up':
          spriteName = 'spider_up';
          break;
        case 'spider_walk_down':
          spriteName = 'spider_down';
          break;
        case 'spider_walk_side':
          spriteName = 'spider_side';
          break;
        case 'spider_walk_diagonal_up':
          spriteName = 'spider_diagonal_up';
          break;
        case 'spider_walk_diagonal_down':
          spriteName = 'spider_diagonal_down';
          break;
        case 'spider_jumping':
          spriteName = 'spider_jumping';
          break;
        default:
          spriteName = 'spider_down';
      }
    }

    const sprite = this.spriteManager.getSprite(spriteName);

    if (sprite && sprite.complete) {
      try {
        // Disable smoothing for crisp sprites
        ctx.imageSmoothingEnabled = false;
        ctx.globalCompositeOperation = 'source-over'; // Ensure normal drawing mode
        
        // No shadow effects to prevent trails
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Optimize frame calculation - use simpler modulo approach
        const frameCount = spriteName === 'spider_jumping' ? 4 : 30;
        const frameWidth = sprite.naturalWidth / frameCount;
        const frameHeight = sprite.naturalHeight;

        // Use frame counter instead of time-based updates for better performance
        if (!spider.frameCounter) spider.frameCounter = 0;
        spider.frameCounter++;
        const frameIndex = Math.floor(spider.frameCounter / 12) % frameCount; // Update every 12 game frames

        const drawX = Math.floor(screenX - (spiderWidth - this.tileSize) / 2);
        const drawY = Math.floor(screenY - (spiderHeight - this.tileSize) / 2);
        
        // Simplified sprite drawing
        ctx.drawImage(
          sprite,
          frameIndex * frameWidth, 0, frameWidth, frameHeight,
          drawX, drawY, spiderWidth, spiderHeight
        );

        // Remove sparkle effects entirely to prevent trails
        // No sparkle effects

      } catch (error) {
        console.error("Error drawing spider sprite:", error, spriteName);
        this.renderFallbackSpider(ctx, screenX, screenY);
      }
    } else {
      this.renderFallbackSpider(ctx, screenX, screenY);
    }

    ctx.restore();
  }

  private renderFallbackSpider(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();

    const spiderSize = this.tileSize * 1.5; // Height based on tile size

    // Enhanced fallback spider - much more visible like flowers
    const centerX = screenX + this.tileSize / 2;
    const centerY = screenY + this.tileSize / 2;

    // Main body
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, spiderSize * 0.3, spiderSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Abdomen
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + spiderSize * 0.1, spiderSize * 0.2, spiderSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const legLength = spiderSize * 0.4;
      const startX = centerX + Math.cos(angle) * spiderSize * 0.15;
      const startY = centerY + Math.sin(angle) * spiderSize * 0.1;
      const endX = centerX + Math.cos(angle) * legLength;
      const endY = centerY + Math.sin(angle) * legLength * 0.6;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(centerX - spiderSize * 0.1, centerY - spiderSize * 0.05, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + spiderSize * 0.1, centerY - spiderSize * 0.05, 2, 0, Math.PI * 2);
    ctx.fill();

    // Blue glow for mechanical effect
    ctx.shadowColor = "#3333ff";
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "#6666ff";
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, spiderSize, spiderSize);

    ctx.restore();
  }

  // Spider management methods
  public addSpider(spider: any): void {
    // Remove any existing spider with the same instanceId to prevent duplicates
    this.spiders = this.spiders.filter(s => s.instanceId !== spider.instanceId);
    // Add the new/updated spider
    this.spiders.push(spider);
  }

  public removeSpider(instanceId: string): void {
    this.spiders = this.spiders.filter(spider => spider.instanceId !== instanceId);
  }

  public updateSpider(instanceId: string, x: number, y: number, currentAnimation: string, lastDirection: any): void {
    const spider = this.spiders.find(s => s.instanceId === instanceId);
    if (spider) {
      spider.x = x;
      spider.y = y;
      spider.currentAnimation = currentAnimation;
      spider.lastDirection = lastDirection;
    }
  }

  public addFlower(tileX: number, tileY: number, maxAge: number = 15000): FlowerTile | null {
    const flowerKey = `${tileX},${tileY}`;

    // Don't place flower if tile is already occupied
    if (this.flowers.has(flowerKey)) {
      return null;
    }

    const flower: FlowerTile = {
      tileX,
      tileY,
      age: 0,
      maxAge,
      bloomStage: 0,
      lastShot: 0,
      shotCooldown: 2500,
      shotsRemaining: 6,
      id: this.nextFlowerId++
    };

    this.flowers.set(flowerKey, flower);
    return flower;
  }

  public removeFlower(tileX: number, tileY: number): void {
    const flowerKey = `${tileX},${tileY}`;
    this.flowers.delete(flowerKey);
  }

  public getFlower(tileX: number, tileY: number): FlowerTile | null {
    const flowerKey = `${tileX},${tileY}`;
    return this.flowers.get(flowerKey) || null;
  }

  public getAllFlowers(): FlowerTile[] {
    return Array.from(this.flowers.values());
  }

  public updateFlowers(deltaTime: number): void {
    const now = Date.now();
    const flowersToRemove: string[] = [];

    // Convert Map to array to avoid iteration issues
    const flowersArray = Array.from(this.flowers.entries());

    for (const [key, flower] of flowersArray) {
      // Always update flowers regardless of game state to prevent animation reset issues
      flower.age += deltaTime * 1000;

      // Update bloom stage based on age - grow over 1.5 seconds (faster growth)
      const growthTime = 1500; // 1.5 seconds to fully grow
      const ageRatio = flower.age / flower.maxAge;

      if (flower.age < growthTime) {
        // Growing phase - progress through stages 0-5 over 1.5 seconds
        const growthProgress = flower.age / growthTime;
        flower.bloomStage = Math.min(Math.floor(growthProgress * 6), 5);
      } else {
        // Fully mature
        flower.bloomStage = 5;
      }

      // Check if flower should be removed
      if (flower.age >= flower.maxAge || flower.shotsRemaining <= 0) {
        flowersToRemove.push(key);
      }
    }

    // Remove expired flowers
    flowersToRemove.forEach(key => this.flowers.delete(key));
  }

  public canFlowerShoot(flower: FlowerTile): boolean {
    const now = Date.now();
    return flower.bloomStage >= 5 && // Only fully grown flowers can shoot
           now - flower.lastShot >= flower.shotCooldown && 
           flower.shotsRemaining > 0;
  }

  public flowerShoot(flower: FlowerTile): void {
    flower.lastShot = Date.now();
    flower.shotsRemaining--;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  // Cleanup old chunks that are far from camera to prevent memory leaks
  public cleanupChunks(camera: Camera): void {
    const currentChunkX = Math.floor(camera.x / (this.chunkSize * this.tileSize));
    const currentChunkY = Math.floor(camera.y / (this.chunkSize * this.tileSize));
    const maxDistance = 3; // Keep chunks within 3 chunks of camera

    const chunksToRemove: string[] = [];
    this.loadedChunks.forEach((_, key) => {
      const [chunkX, chunkY] = key.split(',').map(Number);
      const distance = Math.max(Math.abs(chunkX - currentChunkX), Math.abs(chunkY - currentChunkY));

      if (distance > maxDistance) {
        chunksToRemove.push(key);
      }
    });

    chunksToRemove.forEach(key => this.loadedChunks.delete(key));
  }

  // Orb management methods
  public addOrb(orb: SylphOrb): void {
    this.orbs.push(orb);
  }

  public updateOrbs(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.orbs = this.orbs.filter((orb) => {
      orb.age += deltaTime * 1000;
      orb.life = Math.max(0, 1 - orb.age / orb.maxLife);

      if (orb.life <= 0) return false;

      // Homing phase - fast tracking toward nearest enemy
      const nearestEnemy = this.findNearestEnemy(enemies, orb.x, orb.y, 400);

      if (nearestEnemy) {
        const dx = nearestEnemy.x - orb.x;
        const dy = nearestEnemy.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          // Strong homing with mystical curves
          const orbLifeRatio = orb.age / orb.maxLife;
          const waveIntensity = Math.sin(orb.age * 0.004) * 20 * (1 - orbLifeRatio);
          const perpX = -dy / distance;
          const perpY = dx / distance;

          // Accelerating homing force
          const proximityBoost = Math.max(0.7, 1 - (distance / 250));
          const homingForce = orb.homingSpeed * deltaTime * proximityBoost * 1.5;

          orb.vx += (dx / distance) * homingForce;
          orb.vy += (dy / distance) * homingForce;

          // Mystical wave motion
          orb.vx += perpX * waveIntensity * deltaTime;
          orb.vy += perpY * waveIntensity * deltaTime;

          // Dynamic speed limit - much faster when homing
          const maxSpeed = 300 + (proximityBoost * 200);
          const currentSpeed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
          if (currentSpeed > maxSpeed) {
            const speedRatio = maxSpeed / currentSpeed;
            orb.vx *= speedRatio;
            orb.vy *= speedRatio;
          }
        }
      } else {
        // No target - gentle floating
        orb.vx *= 0.95;
        orb.vy *= 0.95;
      }

      // Always update position
      orb.x += orb.vx * deltaTime;
      orb.y += orb.vy * deltaTime;

      // Efficient cleanup
      const playerDistSq = (orb.x - playerX) * (orb.x - playerX) + (orb.y - playerY) * (orb.y - playerY);
      return playerDistSq < 4000000;
    });
  }

  public checkOrbCollisions(enemies: any[]): { enemy: any; damage: number; orbX: number; orbY: number }[] {
    const collisions: { enemy: any; damage: number; orbX: number; orbY: number }[] = [];

    this.orbs.forEach((orb) => {
      if (orb.life <= 0) return;

      enemies.forEach((enemy) => {
        if (enemy.health <= 0) return;

        const dx = enemy.x - orb.x;
        const dy = enemy.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const collisionRadius = orb.size + 8;

        if (distance < collisionRadius) {
          const wasAlive = enemy.isAlive();
          enemy.takeDamage(orb.damage);
          orb.life = 0;

          // Record collision for experience orb spawning
          collisions.push({
            enemy: enemy,
            damage: orb.damage,
            orbX: orb.x,
            orbY: orb.y
          });
        }
      });
    });

    this.orbs = this.orbs.filter((orb) => orb.life > 0);
    return collisions;
  }

  public getAllOrbs(): SylphOrb[] {
    return [...this.orbs];
  }

  private findNearestEnemy(enemies: any[], x: number, y: number, maxRange: number): any | null {
    let nearest: any | null = null;
    let nearestDistance = maxRange;

    enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;

      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  public fireOrbFromFlower(flower: FlowerTile, targetEnemy: any, damage: number): void {
    const flowerSize = this.tileSize * 3;

    // Position orb at the flower bud (start directly from bud)
    const flowerCenterX = flower.tileX * this.tileSize + Math.floor(this.tileSize / 2);
    const flowerGroundY = flower.tileY * this.tileSize + Math.floor(this.tileSize / 2);
    const flowerBudY = flowerGroundY - Math.floor(flowerSize * 0.3);

    // Calculate initial velocity toward target
    const dx = targetEnemy.x - flowerCenterX;
    const dy = targetEnemy.y - flowerBudY;
    const distance = Math.sqrt(dx * dx + dy * dy);    const initialSpeed = 250;

    const orb: SylphOrb = {
      x: flowerCenterX,
      y: flowerBudY,
      vx: distance > 0 ? (dx / distance) * initialSpeed : 0,
      vy: distance > 0 ? (dy / distance) * initialSpeed : 0,
      life: 1,
      maxLife: 5000,
      size: 6,
      color: "#ff69b4",
      age: 0,
      targetEnemyId: Math.random(),
      homingSpeed: 300,
      damage: damage * (1 + flower.bloomStage * 0.2),
      phase: 'homing',
      riseStartY: flowerBudY,
      riseTargetY: flowerBudY,
      riseProgress: 1,
      targetX: targetEnemy.x,
      targetY: targetEnemy.y
    };

    this.addOrb(orb);
  }
}
