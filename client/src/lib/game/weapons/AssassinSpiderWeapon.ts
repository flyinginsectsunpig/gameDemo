import { BaseWeapon } from "./WeaponTypes";
import { Projectile } from "./Projectile";
import { FollowerSpider } from "../entities/FollowerSpider";
import { Enemy } from "../entities/Enemy";

// Global tracking for weapons
let globalWeaponCount = 0;

export class AssassinSpiderWeapon extends BaseWeapon {
  private followerSpiders: FollowerSpider[] = [];
  private hasSpawned = false;
  private spawnTimer = 0;
  private spawnDelay = 2; // seconds before first spider spawns
  private maxSpiders = 2; // Maximum number of spiders
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
    // Clean up dead spiders
    this.followerSpiders = this.followerSpiders.filter(spider => {
      if (!spider.isAlive()) {
        spider.destroy();
        console.log(`[${this.weaponId}] Spider died - Total spiders: ${this.followerSpiders.length - 1}`);
        return false;
      }
      return true;
    });

    // Spawn spiders if we don't have enough and haven't spawned before
    if (this.followerSpiders.length < this.maxSpiders && !this.hasSpawned) {
      this.spawnTimer += deltaTime;

      if (this.spawnTimer >= this.spawnDelay) {
        // Spawn multiple spiders with different positions
        for (let i = this.followerSpiders.length; i < this.maxSpiders; i++) {
          // Different offset positions for each spider
          const offsetX = -80 - (i * 50); // Spread them out more behind player
          const offsetY = -30 + (i * 40); // More vertical spread

          const newSpider = new FollowerSpider(playerPos.x + offsetX, playerPos.y + offsetY);
          this.followerSpiders.push(newSpider);
          console.log(`[${this.weaponId}] Spawned follower spider ${i + 1} at (${playerPos.x + offsetX}, ${playerPos.y + offsetY}) - Total spiders: ${this.followerSpiders.length}`);
        }

        this.hasSpawned = true; // Mark as spawned to prevent duplicates
      }
    }

    // Update all spiders with current player position
    this.followerSpiders.forEach((spider, index) => {
      // Each spider follows directly on top of player with minimal offset
      const followPos = {
        x: playerPos.x - (index * 10), // Very small offset to distinguish multiple spiders
        y: playerPos.y - (index * 10)
      };
      // Note: For weapon spiders, we don't have access to player movement direction
      // so they'll use the basic following behavior
      spider.update(deltaTime, followPos);
    });
  }

  public renderSpiders(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    this.followerSpiders.forEach(spider => {
      spider.render(ctx, deltaTime, cameraX, cameraY);
    });
  }

  public getSpiders(): FollowerSpider[] {
    return this.followerSpiders;
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