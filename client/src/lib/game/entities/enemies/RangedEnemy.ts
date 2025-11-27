import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';
import { EnemyProjectile } from './EnemyProjectile';

export class RangedEnemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  
  private preferredDistance: number = 175;
  private minDistance: number = 150;
  private maxDistance: number = 200;
  private shootTimer: number = 0;
  private shootCooldown: number = 2.5;
  private projectileQueue: EnemyProjectile[] = [];
  private isAiming: boolean = false;
  private aimTimer: number = 0;
  private aimDuration: number = 0.5;
  private targetPos: { x: number; y: number } | null = null;

  constructor(x: number, y: number) {
    super(x, y, 70, 70);
    this.collisionWidth = 28;
    this.collisionHeight = 28;
    
    this.speed = 40;
    this.health = 1;
    this.maxHealth = 1;
    this.damage = 10;
    this.scoreValue = 25;
    
    this.shootCooldown = 2 + Math.random();
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.alive) return;

    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.minDistance) {
      const moveX = -(dx / distance) * this.speed * deltaTime;
      const moveY = -(dy / distance) * this.speed * deltaTime;
      this.x += moveX;
      this.y += moveY;
    } else if (distance > this.maxDistance) {
      const moveX = (dx / distance) * this.speed * deltaTime;
      const moveY = (dy / distance) * this.speed * deltaTime;
      this.x += moveX;
      this.y += moveY;
    } else {
      const strafeAngle = Math.sin(Date.now() * 0.002) * 0.5;
      const perpX = -dy / distance;
      const perpY = dx / distance;
      this.x += perpX * this.speed * 0.5 * strafeAngle * deltaTime;
      this.y += perpY * this.speed * 0.5 * strafeAngle * deltaTime;
    }

    if (this.isAiming) {
      this.aimTimer += deltaTime;
      if (this.aimTimer >= this.aimDuration && this.targetPos) {
        this.fireProjectile(this.targetPos);
        this.isAiming = false;
        this.aimTimer = 0;
        this.targetPos = null;
      }
    } else {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown && distance < this.maxDistance * 1.5) {
        this.isAiming = true;
        this.targetPos = { x: playerPos.x, y: playerPos.y };
        this.shootTimer = 0;
      }
    }
  }

  private fireProjectile(targetPos: { x: number; y: number }): void {
    const projectile = new EnemyProjectile(this.x, this.y, targetPos.x, targetPos.y, this.damage);
    this.projectileQueue.push(projectile);
  }

  public getProjectiles(): EnemyProjectile[] {
    const projectiles = [...this.projectileQueue];
    this.projectileQueue = [];
    return projectiles;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    ctx.save();
    
    ctx.fillStyle = "#9944cc";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#6622aa";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.isAiming && this.targetPos) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      
      const dx = this.targetPos.x - this.x;
      const dy = this.targetPos.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const lineLength = Math.min(dist, 50);
      ctx.lineTo(this.x + (dx / dist) * lineLength, this.y + (dy / dist) * lineLength);
      ctx.stroke();
      ctx.setLineDash([]);
      
      const pulseSize = 8 + Math.sin(Date.now() * 0.01) * 4;
      ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseSize + this.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(this.x - 10, this.y - 5, 6, 0, Math.PI * 2);
    ctx.arc(this.x + 10, this.y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(this.x - 10, this.y - 5, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 10, this.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.health < this.maxHealth) {
      this.renderHealthBar(ctx);
    }
    
    ctx.restore();
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = this.width;
    const barHeight = 3;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = "#333333";
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 8, barWidth, barHeight);

    ctx.fillStyle = "#44ff44";
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 8, barWidth * healthPercent, barHeight);
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getDamage(): number {
    return this.damage;
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }

  public getType(): string {
    return "ranged";
  }

  public isAimingState(): boolean {
    return this.isAiming;
  }
}
