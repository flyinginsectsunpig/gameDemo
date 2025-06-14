export class SpriteManager {
  private static instance: SpriteManager;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  private constructor() {}

  public static getInstance(): SpriteManager {
    if (!SpriteManager.instance) {
      SpriteManager.instance = new SpriteManager();
    }
    return SpriteManager.instance;
  }

  public async loadSprite(name: string, src: string): Promise<HTMLImageElement> {
    // Return cached sprite if already loaded
    if (this.sprites.has(name)) {
      return this.sprites.get(name)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // Create new loading promise
    const loadingPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(name, img);
        this.loadingPromises.delete(name);
        console.log(`Loaded sprite: ${name} from ${src} (${img.naturalWidth}x${img.naturalHeight})`);
        
        // Debug spider sprites specifically
        if (name.includes('spider')) {
          console.log(`Spider sprite ${name}: dimensions ${img.naturalWidth}x${img.naturalHeight}, complete: ${img.complete}`);
        }
        
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(name);
        console.error(`Failed to load sprite: ${name} from ${src}`);
        reject(new Error(`Failed to load sprite: ${name}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(name, loadingPromise);
    return loadingPromise;
  }

  public getSprite(name: string): HTMLImageElement | null {
    return this.sprites.get(name) || null;
  }

  public async loadAllSprites(): Promise<void> {
    const spritesToLoad = [
      { name: "player", src: "/assets/sprites/walking_Down_weapon.png" },
      { name: "player_diagonal", src: "/assets/sprites/top_diagonal_sheet.png" },
      { name: "player_forward", src: "/assets/sprites/forward-sheet_1749393148210.png" },
      { name: "player_sideways", src: "/assets/sprites/Walking_Sideways_weapon.png" },
      { name: "player_down", src: "/assets/sprites/walking_Down_weapon.png" },
      { name: "player_diagonal_down", src: "/assets/sprites/Walking_diagonal_Down_weapon_1749410363417.png" },
      { name: "player_up", src: "/assets/sprites/walking_up_weapon.png" },
      // Assassin character sprites
      { name: "assassin_diagonal_back", src: "/assets/sprites/assassin_diagonal_back.png" },
      { name: "assassin_diagonal_front", src: "/assets/sprites/assassin_diagonal_front.png" },
      { name: "assassin_down", src: "/assets/sprites/assassin_down.png" },
      { name: "assassin_sideways", src: "/assets/sprites/assassin_sideways.png" },
      { name: "assassin_up", src: "/assets/sprites/assassin_up.png" },
      { name: "enemy_basic", src: "/assets/sprites/enemy_basic.png" },
      { name: "enemy_fast", src: "/assets/sprites/enemy_fast.png" },
      { name: "enemy_tank", src: "/assets/sprites/enemy_tank.png" },
      // Spider sprites
      { name: "spider_down", src: "/assets/sprites/spider/spider_down.png" },
      { name: "spider_up", src: "/assets/sprites/spider/spider_up.png" },
      { name: "spider_side", src: "/assets/sprites/spider/spider_side.png" },
      { name: "spider_diagonal_down", src: "/assets/sprites/spider/spider_diagonal_down.png" },
      { name: "spider_diagonal_up", src: "/assets/sprites/spider/spider_diagonal_up.png" },
      { name: "spider_jumping", src: "/assets/sprites/spider/spider_jumping.png" },
      { name: "objects", src: "/assets/tilesets/PNG/Objects.png" },
      { name: "details", src: "/assets/tilesets/PNG/Details.png" },
      { name: "flower_growing", src: "/assets/sprites/flower_growing.png" },
      { name: "undead_tileset", src: "/assets/tilesets/PNG/Ground_new.png" }
    ];

    try {
      await Promise.all(
        spritesToLoad.map(sprite => this.loadSprite(sprite.name, sprite.src))
      );
      console.log('All sprites loaded successfully');
    } catch (error) {
      console.error('Failed to load some sprites:', error);
    }
  }

  public clearSprites(): void {
    this.sprites.clear();
    this.loadingPromises.clear();
  }
}