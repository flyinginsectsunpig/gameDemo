import { GameObject } from "./Player";

export class Projectile implements GameObject {
  public x: number;
  public y: number;
  public width = 4;
  public height = 4;
  private vx: number;
  private vy: number;
  private damage: number;
  private alive = true;
  private lifetime = 3; // seconds
  private piercing = false;
  private hitCount = 0;
  private maxHits = 1;

  constructor(x: number, y: number, vx: number, vy: number, damage: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }

  public update(deltaTime: number) {
    if (!this.alive) return;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy() {
    this.alive = false;
  }

  public getDamage(): number {
    return this.damage;
  }

  public isPiercing(): boolean {
    return this.piercing;
  }

  public setPiercing(piercing: boolean, maxHits: number = 3) {
    this.piercing = piercing;
    this.maxHits = maxHits;
  }

  public addHit(): boolean {
    if (this.piercing) {
      this.hitCount++;
      if (this.hitCount >= this.maxHits) {
        this.destroy();
        return true; // Projectile should be destroyed
      }
      return false; // Projectile continues
    } else {
      this.destroy();
      return true; // Regular projectile is destroyed after one hit
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;

    ctx.fillStyle = "#ffff44";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Add a bright center
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      this.x - 1,
      this.y - 1,
      2,
      2
    );
  }
}
