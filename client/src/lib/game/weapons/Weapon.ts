import { BaseWeapon } from "./WeaponTypes";
import { Projectile } from "./Projectile";

export class Weapon extends BaseWeapon {
  constructor(fireRate: number = 2, damage: number = 10, projectileSpeed: number = 300) {
    super(fireRate, damage, projectileSpeed);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction?: { x: number; y: number }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) {
      return [];
    }

    const dir = direction || { x: 1, y: 0 };
    const magnitude = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    const normalizedX = magnitude > 0 ? dir.x / magnitude : 1;
    const normalizedY = magnitude > 0 ? dir.y / magnitude : 0;

    const projectile = new Projectile(
      playerX,
      playerY,
      normalizedX * this.projectileSpeed,
      normalizedY * this.projectileSpeed,
      this.damage
    );

    return [projectile];
  }

  public abstract update(deltaTime: number, ...args: any[]): void;

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    // Render projectiles with camera offset
    this.projectiles.forEach(projectile => {
      projectile.render(ctx, cameraX, cameraY);
    });
  }
}