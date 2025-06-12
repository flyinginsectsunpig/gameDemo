import { Projectile } from "./Projectile";

export abstract class BaseWeapon {
  protected fireRate: number;
  protected timeSinceLastShot = 0;
  protected damage: number;
  protected projectileSpeed: number;

  constructor(fireRate: number, damage: number, projectileSpeed: number) {
    this.fireRate = fireRate;
    this.damage = damage;
    this.projectileSpeed = projectileSpeed;
  }

  public abstract fire(deltaTime: number, playerX: number, playerY: number, direction?: { x: number; y: number }): Projectile[];

  public upgradeDamage() {
    this.damage += 1;
  }

  public upgradeFireRate() {
    this.fireRate += 1;
  }

  protected updateFireTimer(deltaTime: number): boolean {
    this.timeSinceLastShot += deltaTime;
    const shotInterval = 1 / this.fireRate;

    if (this.timeSinceLastShot >= shotInterval) {
      this.timeSinceLastShot = 0;
      return true;
    }
    return false;
  }
}