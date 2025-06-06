import { Projectile } from "./Projectile";

export class Weapon {
  private fireRate = 3; // shots per second
  private timeSinceLastShot = 0;
  private projectileSpeed = 300;
  private damage = 1;

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    this.timeSinceLastShot += deltaTime;

    const shotInterval = 1 / this.fireRate;
    const projectiles: Projectile[] = [];

    // Fire if enough time has passed
    if (this.timeSinceLastShot >= shotInterval) {
      // Find nearest enemy direction (simplified - just fire in 4 directions for now)
      const directions = [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: -1 },  // up
        { x: 0, y: 1 },   // down
      ];

      // Fire a projectile in the first direction (can be improved with enemy targeting)
      const direction = directions[0];
      projectiles.push(new Projectile(
        playerX,
        playerY,
        direction.x * this.projectileSpeed,
        direction.y * this.projectileSpeed,
        this.damage
      ));

      this.timeSinceLastShot = 0;
    }

    return projectiles;
  }

  public upgrade() {
    this.fireRate += 0.5;
    this.damage += 0.5;
  }

  public upgradeDamage() {
    this.damage += 1;
  }

  public upgradeFireRate() {
    this.fireRate += 1;
  }
}
