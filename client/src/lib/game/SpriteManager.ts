export class SpriteManager {
  private static instance: SpriteManager;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loaded: Map<string, boolean> = new Map();

  private constructor() {}

  public static getInstance(): SpriteManager {
    if (!SpriteManager.instance) {
      SpriteManager.instance = new SpriteManager();
    }
    return SpriteManager.instance;
  }

  public async loadSprite(name: string, path: string): Promise<HTMLImageElement> {
    if (this.sprites.has(name) && this.loaded.get(name)) {
      return this.sprites.get(name)!;
    }

    const img = new Image();
    img.src = path;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.sprites.set(name, img);
        this.loaded.set(name, true);
        console.log(`Loaded sprite: ${name}`);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${path}`);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
    });
  }

  public getSprite(name: string): HTMLImageElement | null {
    return this.sprites.get(name) || null;
  }

  public async loadAllSprites(): Promise<void> {
    const spritePromises = [
      this.loadSprite('player', '/textures/player.png'),
      this.loadSprite('enemy_basic', '/textures/enemy_basic.png'),
      this.loadSprite('enemy_fast', '/textures/enemy_fast.png'),
      this.loadSprite('enemy_tank', '/textures/enemy_tank.png'),
      this.loadSprite('ground_rocks', '/Tileset/PNG/Ground_rocks.png'),
      this.loadSprite('objects', '/Tileset/PNG/Objects.png'),
      this.loadSprite('details', '/Tileset/PNG/Details.png'),
      this.loadSprite('projectile', '/textures/projectile.png')
    ];

    try {
      await Promise.all(spritePromises);
      console.log('All sprites loaded successfully');
    } catch (error) {
      console.warn('Some sprites failed to load, falling back to shapes:', error);
    }
  }

  public drawTiledBackground(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    const groundRocks = this.getSprite('ground_rocks');
    const objects = this.getSprite('objects');
    const details = this.getSprite('details');
    
    if (!groundRocks) {
      // Create a wasteland-themed fallback pattern
      this.drawWastelandFallbackBackground(ctx, canvasWidth, canvasHeight);
      return;
    }

    // Enable smooth scaling with maximum quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Force anti-aliasing
    (ctx as any).mozImageSmoothingEnabled = true;
    (ctx as any).webkitImageSmoothingEnabled = true;
    (ctx as any).msImageSmoothingEnabled = true;

    const tileSize = 48; // Smaller tiles for better quality
    const tilesX = Math.ceil(canvasWidth / tileSize) + 1;
    const tilesY = Math.ceil(canvasHeight / tileSize) + 1;
    const srcSize = 16; // Source tile size in the tileset
    const tilesPerRow = Math.floor(groundRocks.width / srcSize);
    
    // Draw base ground layer with rocks and cracked earth
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        let tileIndex = 0;
        
        // Create varied wasteland terrain
        if ((x + y) % 7 === 0) {
          tileIndex = 4; // Cracked earth
        } else if ((x % 4 === 0 && y % 3 === 0)) {
          tileIndex = 5; // Rocky patches
        } else if ((x + y) % 5 === 0) {
          tileIndex = 6; // Dry ground
        } else if ((x * 2 + y) % 8 === 0) {
          tileIndex = 3; // Dark soil
        } else {
          tileIndex = Math.floor((x * 7 + y * 3) % 12); // More varied base
        }
        
        const srcX = (tileIndex % tilesPerRow) * srcSize;
        const srcY = Math.floor(tileIndex / tilesPerRow) * srcSize;
        
        ctx.drawImage(
          groundRocks,
          srcX, srcY, srcSize, srcSize,
          x * tileSize, y * tileSize, tileSize, tileSize
        );
      }
    }

    // Add wasteland objects (bones, dead trees, rocks) sparsely
    if (objects) {
      const objectTilesPerRow = Math.floor(objects.width / srcSize);
      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          // Sparse placement of wasteland objects
          if ((x * 13 + y * 7) % 25 === 0) {
            const objectIndex = Math.floor((x + y) % 8); // Use first row of objects
            const objSrcX = (objectIndex % objectTilesPerRow) * srcSize;
            const objSrcY = 0; // First row
            
            ctx.drawImage(
              objects,
              objSrcX, objSrcY, srcSize, srcSize,
              x * tileSize, y * tileSize, tileSize, tileSize
            );
          }
        }
      }
    }

    // Add small details (debris, small rocks) even more sparsely
    if (details) {
      const detailTilesPerRow = Math.floor(details.width / srcSize);
      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          // Very sparse detail placement
          if ((x * 17 + y * 11) % 35 === 0) {
            const detailIndex = Math.floor((x * 3 + y * 2) % 6);
            const detSrcX = (detailIndex % detailTilesPerRow) * srcSize;
            const detSrcY = 0;
            
            ctx.drawImage(
              details,
              detSrcX, detSrcY, srcSize, srcSize,
              x * tileSize, y * tileSize, tileSize, tileSize
            );
          }
        }
      }
    }
  }

  private drawWastelandFallbackBackground(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    // Create a wasteland-themed fallback pattern
    const tileSize = 64;
    const tilesX = Math.ceil(canvasWidth / tileSize) + 1;
    const tilesY = Math.ceil(canvasHeight / tileSize) + 1;

    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        // Create varied wasteland colors
        if ((x + y) % 7 === 0) {
          ctx.fillStyle = "#3d2f1f"; // Cracked earth brown
        } else if ((x % 4 === 0 && y % 3 === 0)) {
          ctx.fillStyle = "#4a3a2a"; // Rocky brown
        } else if ((x + y) % 5 === 0) {
          ctx.fillStyle = "#2f2520"; // Dark soil
        } else if ((x * 2 + y) % 8 === 0) {
          ctx.fillStyle = "#5a4a35"; // Dusty earth
        } else {
          ctx.fillStyle = "#332922"; // Base wasteland color
        }
        
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        
        // Add cracks and debris
        if (Math.random() > 0.6) {
          ctx.fillStyle = "#1f1812";
          ctx.fillRect(
            x * tileSize + Math.random() * (tileSize - 8),
            y * tileSize + Math.random() * (tileSize - 8),
            3 + Math.random() * 5, 
            1 + Math.random() * 2
          );
        }
        
        // Add small rocks/debris
        if (Math.random() > 0.8) {
          ctx.fillStyle = "#2a1f15";
          ctx.fillRect(
            x * tileSize + Math.random() * (tileSize - 4),
            y * tileSize + Math.random() * (tileSize - 4),
            2, 2
          );
        }
      }
    }
  }
}