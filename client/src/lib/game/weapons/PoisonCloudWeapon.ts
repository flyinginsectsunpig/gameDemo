
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";

interface PoisonCloud {
  x: number;
  y: number;
  radius: number;
  lifetime: number;
  maxLifetime: number;
  damage: number;
}

export class PoisonCloudWeapon extends BaseWeapon {
  private clouds: PoisonCloud[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 3;
  private cloudDamage: number = 5;
  private cloudRadius: number = 100;
  private cloudLifetime: number = 5;
  private maxClouds: number = 3;

  constructor() {
    super(5, 0.3, 0); // damage, fireRate, projectileSpeed
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval && this.clouds.length < this.maxClouds) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      
      this.clouds.push({
        x: playerX + Math.cos(angle) * distance,
        y: playerY + Math.sin(angle) * distance,
        radius: this.cloudRadius,
        lifetime: this.cloudLifetime,
        maxLifetime: this.cloudLifetime,
        damage: this.cloudDamage
      });

      this.spawnTimer = 0;
    }

    this.clouds = this.clouds.filter(cloud => {
      cloud.lifetime -= deltaTime;
      
      enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        const dx = enemy.x - cloud.x;
        const dy = enemy.y - cloud.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= cloud.radius) {
          enemy.takeDamage(cloud.damage * deltaTime);
        }
      });

      return cloud.lifetime > 0;
    });
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.clouds.forEach(cloud => {
      const alpha = cloud.lifetime / cloud.maxLifetime;
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      
      const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      gradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 200, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 150, 0, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  public fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.cloudDamage += 2;
    this.cloudRadius += 10;
    this.maxClouds = Math.min(6, this.maxClouds + 1);
    this.cloudLifetime += 0.5;
  }

  public getType(): string {
    return "poison_cloud";
  }

  public getClouds(): PoisonCloud[] {
    return this.clouds;
  }
}
