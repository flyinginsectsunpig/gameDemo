import { Enemy } from "../entities/enemies/Enemy";
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

  public fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[] {
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
