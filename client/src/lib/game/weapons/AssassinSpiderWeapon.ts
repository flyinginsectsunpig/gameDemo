
import { BaseWeapon } from "./WeaponTypes";
import { Projectile } from "./Projectile";
import { MechanicalSpider } from "../entities/MechanicalSpider";
import { Enemy } from "../entities/Enemy";

export class AssassinSpiderWeapon extends BaseWeapon {
  private spiders: MechanicalSpider[] = [];
  private maxSpiders = 3;
  private spawnTimer = 0;
  private spawnCooldown = 4; // spawn a spider every 4 seconds

  constructor() {
    super(0.25, 0, 0); // No traditional projectiles
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction?: { x: number; y: number }): Projectile[] {
    this.spawnTimer += deltaTime;

    // Spawn new spiders if we have room and cooldown is ready
    if (this.spiders.length < this.maxSpiders && this.spawnTimer >= this.spawnCooldown) {
      // Spawn spider near player with slight random offset
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;
      
      const spider = new MechanicalSpider(playerX + offsetX, playerY + offsetY);
      this.spiders.push(spider);
      this.spawnTimer = 0;
    }

    // No traditional projectiles
    return [];
  }

  public updateSpiders(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    // Update all spiders
    this.spiders.forEach(spider => {
      spider.update(deltaTime, enemies, playerPos);
    });

    // Remove dead spiders
    this.spiders = this.spiders.filter(spider => spider.isAlive());
  }

  public renderSpiders(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0) {
    this.spiders.forEach(spider => {
      spider.render(ctx, cameraX, cameraY);
    });
  }

  public getSpiders(): MechanicalSpider[] {
    return this.spiders;
  }

  public upgradeMaxSpiders() {
    this.maxSpiders = Math.min(this.maxSpiders + 1, 6);
  }

  public upgradeSpawnRate() {
    this.spawnCooldown = Math.max(this.spawnCooldown - 0.5, 1.5);
  }

  public upgradeSpiderDamage() {
    // This would need to be implemented in the spider class
    // For now, we could track damage multiplier
  }
}
