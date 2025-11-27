import { Enemy } from "../entities/enemies/Enemy";
import { WeaponRarity } from "./WeaponRarity";

interface Boomerang {
  x: number;
  y: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  maxDistance: number;
  returning: boolean;
  hitEnemies: Set<Enemy>;
  rotation: number;
  active: boolean;
}

export class BoomerangWeapon {
  private damage: number;
  private cooldown: number;
  private maxDistance: number;
  private speed: number;
  private lastFireTime: number = 0;
  private activeBoomerangs: Boomerang[] = [];
  private level: number = 1;
  private rarity: WeaponRarity = WeaponRarity.Common;
  private evolved: boolean = false;
  private boomerangCount: number = 1;
  private hitCooldowns: Map<Enemy, number> = new Map();

  constructor() {
    this.damage = 15;
    this.cooldown = 2.5;
    this.maxDistance = 200;
    this.speed = 350;
  }

  public update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number,
    direction?: { x: number; y: number }
  ): { enemy: Enemy; damage: number }[] {
    this.lastFireTime += deltaTime;
    const hits: { enemy: Enemy; damage: number }[] = [];

    for (const [enemy, time] of this.hitCooldowns) {
      this.hitCooldowns.set(enemy, time - deltaTime);
      if (time - deltaTime <= 0) {
        this.hitCooldowns.delete(enemy);
      }
    }

    this.updateBoomerangs(deltaTime, playerX, playerY, enemies, hits);

    if (this.lastFireTime >= this.getEffectiveCooldown() && this.activeBoomerangs.length === 0) {
      this.lastFireTime = 0;
      this.fireBoomerangs(playerX, playerY, direction);
    }

    return hits;
  }

  private fireBoomerangs(
    playerX: number,
    playerY: number,
    direction?: { x: number; y: number }
  ): void {
    const count = this.evolved ? this.boomerangCount + 2 : this.boomerangCount;
    const baseDir = direction || { x: 1, y: 0 };
    const magnitude = Math.sqrt(baseDir.x * baseDir.x + baseDir.y * baseDir.y);
    const normalizedDir = magnitude > 0 
      ? { x: baseDir.x / magnitude, y: baseDir.y / magnitude }
      : { x: 1, y: 0 };

    for (let i = 0; i < count; i++) {
      let angle = Math.atan2(normalizedDir.y, normalizedDir.x);
      
      if (count > 1) {
        const spreadAngle = Math.PI / 4;
        angle += spreadAngle * (i - (count - 1) / 2) / ((count - 1) / 2 || 1);
      }

      const vx = Math.cos(angle) * this.speed;
      const vy = Math.sin(angle) * this.speed;

      this.activeBoomerangs.push({
        x: playerX,
        y: playerY,
        vx,
        vy,
        startX: playerX,
        startY: playerY,
        maxDistance: this.getEffectiveDistance(),
        returning: false,
        hitEnemies: new Set(),
        rotation: 0,
        active: true
      });
    }
  }

  private updateBoomerangs(
    deltaTime: number,
    playerX: number,
    playerY: number,
    enemies: Enemy[],
    hits: { enemy: Enemy; damage: number }[]
  ): void {
    this.activeBoomerangs = this.activeBoomerangs.filter(boomerang => {
      if (!boomerang.active) return false;

      boomerang.rotation += deltaTime * 15;
      boomerang.x += boomerang.vx * deltaTime;
      boomerang.y += boomerang.vy * deltaTime;

      const dx = boomerang.x - boomerang.startX;
      const dy = boomerang.y - boomerang.startY;
      const distanceTraveled = Math.sqrt(dx * dx + dy * dy);

      if (!boomerang.returning && distanceTraveled >= boomerang.maxDistance) {
        boomerang.returning = true;
        boomerang.hitEnemies.clear();
      }

      if (boomerang.returning) {
        const toPlayerX = playerX - boomerang.x;
        const toPlayerY = playerY - boomerang.y;
        const distToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
        
        if (distToPlayer < 20) {
          boomerang.active = false;
          return false;
        }

        const homingStrength = 8;
        boomerang.vx += (toPlayerX / distToPlayer) * homingStrength;
        boomerang.vy += (toPlayerY / distToPlayer) * homingStrength;

        const currentSpeed = Math.sqrt(boomerang.vx * boomerang.vx + boomerang.vy * boomerang.vy);
        if (currentSpeed > this.speed * 1.5) {
          boomerang.vx = (boomerang.vx / currentSpeed) * this.speed * 1.5;
          boomerang.vy = (boomerang.vy / currentSpeed) * this.speed * 1.5;
        }
      }

      for (const enemy of enemies) {
        if (!enemy.isAlive() || enemy.getHealth() <= 0) continue;
        if (this.hitCooldowns.has(enemy)) continue;

        const ex = enemy.x - boomerang.x;
        const ey = enemy.y - boomerang.y;
        const dist = Math.sqrt(ex * ex + ey * ey);

        if (dist < 30) {
          hits.push({ enemy, damage: this.getBaseDamage() });
          this.hitCooldowns.set(enemy, 0.3);
        }
      }

      return true;
    });
  }

  private getEffectiveCooldown(): number {
    let cd = this.cooldown - (this.level - 1) * 0.2;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        cd *= 0.9;
        break;
      case WeaponRarity.Legendary:
        cd *= 0.8;
        break;
    }

    if (this.evolved) {
      cd *= 0.7;
    }

    return Math.max(cd, 0.5);
  }

  private getEffectiveDistance(): number {
    let distance = this.maxDistance + (this.level - 1) * 30;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        distance *= 1.15;
        break;
      case WeaponRarity.Legendary:
        distance *= 1.3;
        break;
    }

    if (this.evolved) {
      distance *= 1.5;
    }

    return distance;
  }

  private getBaseDamage(): number {
    let baseDamage = this.damage + (this.level - 1) * 4;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        baseDamage *= 1.25;
        break;
      case WeaponRarity.Legendary:
        baseDamage *= 1.5;
        break;
    }

    if (this.evolved) {
      baseDamage *= 2;
    }

    return Math.floor(baseDamage);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number
  ): void {
    for (const boomerang of this.activeBoomerangs) {
      if (!boomerang.active) continue;
      this.renderBoomerang(ctx, boomerang, cameraX, cameraY);
    }
  }

  private renderBoomerang(
    ctx: CanvasRenderingContext2D,
    boomerang: Boomerang,
    cameraX: number,
    cameraY: number
  ): void {
    const screenX = boomerang.x - cameraX;
    const screenY = boomerang.y - cameraY;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(boomerang.rotation);

    const baseColor = this.evolved ? "#FFD700" : "#8B4513";
    const glowColor = this.evolved ? "#FFA500" : "#D2691E";

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = this.evolved ? 15 : 8;

    ctx.fillStyle = baseColor;
    ctx.beginPath();

    const size = this.evolved ? 20 : 15;
    ctx.moveTo(-size, -size / 4);
    ctx.quadraticCurveTo(0, -size / 2, size, -size / 4);
    ctx.quadraticCurveTo(size + size / 3, 0, size, size / 4);
    ctx.quadraticCurveTo(0, size / 2, -size, size / 4);
    ctx.quadraticCurveTo(-size - size / 3, 0, -size, -size / 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();

    if (this.evolved) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  public upgrade(): void {
    this.level = Math.min(this.level + 1, 5);
    this.damage += 4;
    this.maxDistance += 30;
    if (this.level >= 3 && this.boomerangCount < 2) {
      this.boomerangCount = 2;
    }
    if (this.level >= 5 && this.boomerangCount < 3) {
      this.boomerangCount = 3;
    }
  }

  public evolve(): void {
    if (this.level >= 5 && !this.evolved) {
      this.evolved = true;
      this.damage *= 2;
      this.boomerangCount += 2;
      this.speed *= 1.3;
    }
  }

  public getLevel(): number {
    return this.level;
  }

  public isEvolved(): boolean {
    return this.evolved;
  }

  public setRarity(rarity: WeaponRarity): void {
    this.rarity = rarity;
  }

  public getRarity(): WeaponRarity {
    return this.rarity;
  }

  public getName(): string {
    return this.evolved ? "Glaive Storm" : "Boomerang";
  }

  public getDescription(): string {
    return this.evolved 
      ? "Multiple razor-sharp glaives tear through enemies"
      : "A returning weapon that hits enemies twice";
  }
}
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";

interface Boomerang {
  x: number;
  y: number;
  angle: number;
  distance: number;
  maxDistance: number;
  returning: boolean;
  damage: number;
  speed: number;
  hitEnemies: Set<any>;
}

export class BoomerangWeapon extends BaseWeapon {
  private boomerangs: Boomerang[] = [];
  private throwCooldown: number = 2;
  private throwTimer: number = 0;
  private boomerangCount: number = 1;
  private boomerangDamage: number = 25;
  private maxDistance: number = 300;
  private speed: number = 400;

  constructor() {
    super(25, 0.5, 400);
    this.damage = 25;
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.throwTimer += deltaTime;

    if (this.throwTimer >= this.throwCooldown) {
      for (let i = 0; i < this.boomerangCount; i++) {
        const angle = (Math.PI * 2 / this.boomerangCount) * i;
        this.boomerangs.push({
          x: playerX,
          y: playerY,
          angle,
          distance: 0,
          maxDistance: this.maxDistance,
          returning: false,
          damage: this.boomerangDamage,
          speed: this.speed,
          hitEnemies: new Set()
        });
      }
      this.throwTimer = 0;
    }

    this.boomerangs = this.boomerangs.filter(boomerang => {
      const moveDistance = boomerang.speed * deltaTime;

      if (!boomerang.returning) {
        boomerang.distance += moveDistance;
        if (boomerang.distance >= boomerang.maxDistance) {
          boomerang.returning = true;
        }
      } else {
        boomerang.distance -= moveDistance;
        if (boomerang.distance <= 0) {
          return false;
        }
      }

      boomerang.x = playerX + Math.cos(boomerang.angle) * boomerang.distance;
      boomerang.y = playerY + Math.sin(boomerang.angle) * boomerang.distance;

      enemies.forEach((enemy: any) => {
        if (!enemy.isAlive() || boomerang.hitEnemies.has(enemy)) return;

        const dx = enemy.x - boomerang.x;
        const dy = enemy.y - boomerang.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
          enemy.takeDamage(boomerang.damage);
          boomerang.hitEnemies.add(enemy);
        }
      });

      return true;
    });
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.boomerangs.forEach(boomerang => {
      ctx.save();

      ctx.translate(boomerang.x, boomerang.y);
      ctx.rotate(boomerang.distance * 0.05);

      ctx.fillStyle = "#00ffff";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.quadraticCurveTo(-5, -10, 15, -5);
      ctx.quadraticCurveTo(10, 0, 15, 5);
      ctx.quadraticCurveTo(-5, 10, -15, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  public fire(x: number, y: number, direction: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.boomerangDamage += 8;
    this.maxDistance += 50;
    this.speed += 50;
    if (this.boomerangCount < 4) {
      this.boomerangCount++;
    }
  }

  public getType(): string {
    return "boomerang";
  }
}
