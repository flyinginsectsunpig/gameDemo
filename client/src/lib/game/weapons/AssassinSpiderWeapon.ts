
import { BaseWeapon } from "./WeaponTypes";
import { Projectile } from "./Projectile";
import { FollowerSpider } from "../entities/FollowerSpider";
import { Enemy } from "../entities/Enemy";

export class AssassinSpiderWeapon extends BaseWeapon {
  private followerSpider: FollowerSpider | null = null;
  private spawnTimer = 0;
  private spawnDelay = 2; // spawn spider after 2 seconds

  constructor() {
    super(0.25, 0, 0); // No traditional projectiles
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction?: { x: number; y: number }): Projectile[] {
    // No traditional projectiles for assassin
    return [];
  }

  public updateSpiders(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    // Spawn follower spider if we don't have one
    if (!this.followerSpider) {
      this.spawnTimer += deltaTime;
      
      if (this.spawnTimer >= this.spawnDelay) {
        // Spawn spider behind player
        const offsetX = -30; // Behind player
        const offsetY = 0;
        
        this.followerSpider = new FollowerSpider(playerPos.x + offsetX, playerPos.y + offsetY);
        console.log(`Spawned follower spider at (${playerPos.x + offsetX}, ${playerPos.y + offsetY})`);
      }
    } else {
      // Update the follower spider
      this.followerSpider.update(deltaTime, playerPos);
      
      // Remove if somehow died
      if (!this.followerSpider.isAlive()) {
        this.followerSpider = null;
        this.spawnTimer = 0; // Reset spawn timer
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
