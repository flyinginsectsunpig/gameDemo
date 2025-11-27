import { BaseEntity } from '../../core/base/BaseEntity';

export class EnemyProjectile extends BaseEntity {
  public collisionWidth: number;
  public collisionHeight: number;
  private velocityX: number;
  private velocityY: number;
  private speed: number;
  private damage: number;
  private lifetime: number;
  private maxLifetime: number;

  constructor(x: number, y: number, targetX: number, targetY: number, damage: number = 10) {
    super(x, y, 12, 12);
    this.collisionWidth = 10;
    this.collisionHeight = 10;
    this.speed = 200;
    this.damage = damage;
    this.lifetime = 0;
    this.maxLifetime = 5;

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.velocityX = (dx / distance) * this.speed;
      this.velocityY = (dy / distance) * this.speed;
    } else {
      this.velocityX = 0;
      this.velocityY = this.speed;
    }
  }

  public update(deltaTime: number): void {
    if (!this.alive) return;

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.alive = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    ctx.save();
    
    ctx.fillStyle = "#cc00cc";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ff66ff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  public getDamage(): number {
    return this.damage;
  }

  public markForRemoval(): void {
    this.alive = false;
  }
}
