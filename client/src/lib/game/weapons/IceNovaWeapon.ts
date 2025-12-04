
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";
import { Enemy } from "../entities/enemies/Enemy";

interface IceNova {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  lifetime: number;
  active: boolean;
}

interface SlowEffect {
  enemy: Enemy;
  remainingTime: number;
  slowMultiplier: number;
}

export class IceNovaWeapon extends BaseWeapon {
  private novas: IceNova[] = [];
  private cooldown: number = 5;
  private cooldownTimer: number = 0;
  private novaRadius: number = 200;
  private novaDamage: number = 30;
  private slowAmount: number = 0.5;
  private slowDuration: number = 3;
  private slowEffects: Map<Enemy, SlowEffect> = new Map();

  constructor() {
    super(30, 0.2, 0);
    this.damage = 30;
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.cooldownTimer += deltaTime;

    if (this.cooldownTimer >= this.cooldown) {
      this.novas.push({
        x: playerX,
        y: playerY,
        radius: 0,
        maxRadius: this.novaRadius,
        lifetime: 0.5,
        active: true
      });
      this.cooldownTimer = 0;
    }

    this.novas = this.novas.filter(nova => {
      if (!nova.active) return false;

      nova.radius += (nova.maxRadius / nova.lifetime) * deltaTime;
      nova.lifetime -= deltaTime;

      if (nova.lifetime <= 0) {
        nova.active = false;
        return false;
      }

      enemies.forEach((enemy: any) => {
        if (!enemy.isAlive()) return;
        const dx = enemy.x - nova.x;
        const dy = enemy.y - nova.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= nova.radius && distance >= nova.radius - 30) {
          enemy.takeDamage(this.novaDamage * deltaTime);
          this.applySlow(enemy);
        }
      });

      return true;
    });

    this.slowEffects.forEach((effect, enemy) => {
      effect.remainingTime -= deltaTime;
      if (effect.remainingTime <= 0 || !enemy.isAlive()) {
        this.slowEffects.delete(enemy);
      }
    });
  }

  private applySlow(enemy: Enemy): void {
    const existingSlow = this.slowEffects.get(enemy);
    if (existingSlow) {
      existingSlow.remainingTime = this.slowDuration;
    } else {
      this.slowEffects.set(enemy, {
        enemy,
        remainingTime: this.slowDuration,
        slowMultiplier: this.slowAmount
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.novas.forEach(nova => {
      const alpha = nova.lifetime / 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;

      const gradient = ctx.createRadialGradient(nova.x, nova.y, 0, nova.x, nova.y, nova.radius);
      gradient.addColorStop(0, "rgba(100, 200, 255, 0)");
      gradient.addColorStop(0.7, "rgba(100, 200, 255, 0.8)");
      gradient.addColorStop(1, "rgba(150, 220, 255, 0.4)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nova.x, nova.y, nova.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(200, 240, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nova.x, nova.y, nova.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  public fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.novaDamage += 10;
    this.novaRadius += 30;
    this.cooldown = Math.max(2, this.cooldown - 0.5);
    this.slowAmount = Math.min(0.8, this.slowAmount + 0.05);
  }

  public getType(): string {
    return "ice_nova";
  }

  public isEnemySlowed(enemy: Enemy): boolean {
    return this.slowEffects.has(enemy);
  }

  public getSlowMultiplier(enemy: Enemy): number {
    const effect = this.slowEffects.get(enemy);
    return effect ? effect.slowMultiplier : 1;
  }
}
