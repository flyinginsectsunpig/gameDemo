
import { BaseWeapon } from "./WeaponTypes";
import { Projectile } from "./Projectile";
import { FollowerSpider } from "../entities/FollowerSpider";
import { Enemy } from "../entities/Enemy";

// Global tracking for weapons
let globalWeaponCount = 0;

export class AssassinSpiderWeapon extends BaseWeapon {
  private followerSpider: FollowerSpider | null = null;
  private spawnTimer = 0;
  private spawnDelay = 0; // spawn spider immediately
  private hasSpawned = false; // track if spider has been spawned
  private weaponId: string;

  constructor() {
    super(0.25, 0, 0); // No traditional projectiles
    globalWeaponCount++;
    this.weaponId = `weapon_${Date.now()}_${Math.random()}`;
    console.log(`Created AssassinSpiderWeapon: ${this.weaponId}. Global weapon count: ${globalWeaponCount}`);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction?: { x: number; y: number }): Projectile[] {
    // No traditional projectiles for assassin
    return [];
  }

  public updateSpiders(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    // Additional check: if we somehow have spawned flag but no spider, don't spawn again
    if (this.hasSpawned && !this.followerSpider) {
      console.log(`[${this.weaponId}] Spider was spawned before but is now missing - not respawning`);
      return;
    }
    
    // Spawn follower spider if we don't have one and haven't spawned before
    if (!this.followerSpider && !this.hasSpawned) {
      this.spawnTimer += deltaTime;
      
      if (this.spawnTimer >= this.spawnDelay) {
        // Triple check we don't already have a spider
        if (this.followerSpider) {
          console.log(`[${this.weaponId}] Spider already exists, preventing duplicate spawn`);
          return;
        }
        
        // Additional safeguard: check if hasSpawned somehow got set
        if (this.hasSpawned) {
          console.log(`[${this.weaponId}] hasSpawned flag already set, preventing duplicate`);
          return;
        }
        
        // Spawn spider very close to player
        const offsetX = -60; // Closer behind player
        const offsetY = -20; // Slightly offset vertically
        
        this.followerSpider = new FollowerSpider(playerPos.x + offsetX, playerPos.y + offsetY);
        this.hasSpawned = true; // Mark as spawned to prevent duplicates
        console.log(`[${this.weaponId}] Spawned follower spider at (${playerPos.x + offsetX}, ${playerPos.y + offsetY}) - Total spiders: 1`);
      }
    } else if (this.followerSpider) {
      // Update the follower spider
      this.followerSpider.update(deltaTime, playerPos);
      
      // Remove if somehow died (but don't respawn automatically)
      if (!this.followerSpider.isAlive()) {
        this.followerSpider.destroy();
        this.followerSpider = null;
        console.log(`[${this.weaponId}] Spider died - not respawning`);
        // Don't reset hasSpawned - this prevents automatic respawning
        // If you want respawning, you can add upgrade logic later
      }
    }
  }

  public renderSpiders(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (this.followerSpider) {
      this.followerSpider.render(ctx, deltaTime, cameraX, cameraY);
    }
  }

  public getSpiders(): FollowerSpider[] {
    return this.followerSpider ? [this.followerSpider] : [];
  }

  public upgradeMaxSpiders() {
    // Could increase spider size or add abilities
  }

  public upgradeSpawnRate() {
    // Could reduce spawn delay or add multiple spiders
  }

  public upgradeSpiderDamage() {
    // Could add combat abilities to the follower spider
  }
}
