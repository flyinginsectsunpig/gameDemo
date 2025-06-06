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

// Single directional weapon (original)
export class SingleShotWeapon extends BaseWeapon {
  constructor() {
    super(3, 1, 300); // fireRate, damage, speed
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) return [];

    return [new Projectile(
      playerX,
      playerY,
      direction.x * this.projectileSpeed,
      direction.y * this.projectileSpeed,
      this.damage
    )];
  }
}

// Spread shot weapon
export class SpreadShotWeapon extends BaseWeapon {
  private spreadAngle = Math.PI / 6; // 30 degrees
  private projectileCount = 3;

  constructor() {
    super(2, 0.8, 280);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) return [];

    const projectiles: Projectile[] = [];
    const baseAngle = Math.atan2(direction.y, direction.x);
    const angleStep = this.spreadAngle / (this.projectileCount - 1);
    const startAngle = baseAngle - this.spreadAngle / 2;

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = startAngle + (angleStep * i);
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      
      projectiles.push(new Projectile(playerX, playerY, vx, vy, this.damage));
    }

    return projectiles;
  }

  public upgrade() {
    this.projectileCount = Math.min(7, this.projectileCount + 1);
    this.spreadAngle = Math.min(Math.PI / 2, this.spreadAngle + Math.PI / 12);
  }
}

// Rapid fire weapon
export class RapidFireWeapon extends BaseWeapon {
  constructor() {
    super(8, 0.5, 350);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) return [];

    return [new Projectile(
      playerX,
      playerY,
      direction.x * this.projectileSpeed,
      direction.y * this.projectileSpeed,
      this.damage
    )];
  }
}

// Multi-directional weapon
export class MultiDirectionalWeapon extends BaseWeapon {
  private directions = 4;

  constructor() {
    super(1.5, 1.2, 250);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) return [];

    const projectiles: Projectile[] = [];
    const angleStep = (Math.PI * 2) / this.directions;

    for (let i = 0; i < this.directions; i++) {
      const angle = angleStep * i;
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      
      projectiles.push(new Projectile(playerX, playerY, vx, vy, this.damage));
    }

    return projectiles;
  }

  public upgrade() {
    this.directions = Math.min(8, this.directions + 1);
  }
}

// Piercing weapon
export class PiercingWeapon extends BaseWeapon {
  constructor() {
    super(2.5, 2, 320);
  }

  public fire(deltaTime: number, playerX: number, playerY: number, direction = { x: 1, y: 0 }): Projectile[] {
    if (!this.updateFireTimer(deltaTime)) return [];

    const projectile = new Projectile(
      playerX, 
      playerY, 
      direction.x * this.projectileSpeed, 
      direction.y * this.projectileSpeed, 
      this.damage
    );
    projectile.setPiercing(true, 3);

    return [projectile];
  }
}