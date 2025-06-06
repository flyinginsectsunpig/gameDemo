
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
      this.loadSprite('background', '/textures/grass.png'),
      this.loadSprite('projectile', '/textures/projectile.png')
    ];

    try {
      await Promise.all(spritePromises);
      console.log('All sprites loaded successfully');
    } catch (error) {
      console.warn('Some sprites failed to load, falling back to shapes:', error);
    }
  }
}
