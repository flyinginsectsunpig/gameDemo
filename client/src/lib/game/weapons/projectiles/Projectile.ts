import { IProjectile } from "../../core/interfaces/IProjectile";
import { IGameObject } from "../../core/interfaces/IGameObject";

export class Projectile implements IProjectile, IGameObject {
  public x: number;
  public y: number;
  public width = 8;
  public height = 8;
  public vx: number;
  public vy: number;
  private damage: number;
  private alive = true;
  private lifetime = 8;
  private piercing = false;
  private hitCount = 0;
  private maxHits = 1;
  private isSylphOrb = false;

  constructor(x: number, y: number, vx: number, vy: number, damage: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }

  public update(deltaTime: number): void {
    if (!this.alive) return;

    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) && deltaTime > 0 ?
      Math.min(deltaTime, 1/30) : 0.016;

    // Update position
    this.x += this.vx * validDeltaTime;
    this.y += this.vy * validDeltaTime;

    this.lifetime -= validDeltaTime;
    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy(): void {
    this.alive = false;
  }

  public getDamage(): number {
    return this.damage;
  }

  public setSylphOrb(isSylph: boolean): void {
    this.isSylphOrb = isSylph;
  }

  public isSylphOrbProjectile(): boolean {
    return this.isSylphOrb;
  }

  public isPiercing(): boolean {
    return this.piercing;
  }

  public setPiercing(piercing: boolean, maxHits: number = 3): void {
    this.piercing = piercing;
    this.maxHits = maxHits;
  }

  public addHit(): boolean {
    if (this.piercing) {
      this.hitCount++;
      if (this.hitCount >= this.maxHits) {
        this.destroy();
        return true;
      }
      return false;
    } else {
      this.destroy();
      return true;
    }
  }

  public isSylph(): boolean {
    return this.isSylphOrb;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();

    if (this.isSylphOrb) {
      this.renderSylphOrb(ctx, screenX, screenY);
    } else if (this.damage >= 1.5) {
      this.renderEmeraldBolt(ctx, screenX, screenY);
    } else {
      this.renderRegularProjectile(ctx, screenX, screenY);
    }

    ctx.restore();
  }

  private renderSylphOrb(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;

    ctx.shadowColor = "#e91e63";
    ctx.shadowBlur = 15;
    ctx.fillStyle = `rgba(233, 30, 99, ${pulse})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.width / 2 + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.width / 4, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
      ctx.beginPath();
      ctx.arc(
        screenX + (Math.random() - 0.5) * 10,
        screenY + (Math.random() - 0.5) * 10,
        1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  private renderEmeraldBolt(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.shadowColor = "#50c878";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#50c878";
    ctx.beginPath();
    ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#90ee90";
    ctx.beginPath();
    ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(screenX - 2, screenY - 2, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderRegularProjectile(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    const size = 8;

    ctx.fillStyle = "#ffff00";
    ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(screenX - 2, screenY - 2, 4, 4);

    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);

    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
