import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';

export class ShieldedEnemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  
  private shieldActive: boolean = true;
  private shieldTimer: number = 0;
  private shieldDuration: number = 3;
  private shieldCooldown: number = 5;
  private shieldPulse: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 95, 95);
    this.collisionWidth = 38;
    this.collisionHeight = 38;
    
    this.speed = 35;
    this.health = 4;
    this.maxHealth = 4;
    this.damage = 25;
    this.scoreValue = 45;
    
    this.shieldTimer = Math.random() * this.shieldDuration;
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.alive) return;

    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveX = (dx / distance) * this.speed * deltaTime;
      const moveY = (dy / distance) * this.speed * deltaTime;

      this.x += moveX;
      this.y += moveY;
    }

    this.shieldTimer += deltaTime;
    this.shieldPulse += deltaTime * 5;

    if (this.shieldActive) {
      if (this.shieldTimer >= this.shieldDuration) {
        this.shieldActive = false;
        this.shieldTimer = 0;
      }
    } else {
      if (this.shieldTimer >= this.shieldCooldown) {
        this.shieldActive = true;
        this.shieldTimer = 0;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    ctx.save();
    
    if (this.shieldActive) {
      const pulseSize = 1 + Math.sin(this.shieldPulse) * 0.1;
      const shieldRadius = (this.width / 2 + 15) * pulseSize;
      
      const gradient = ctx.createRadialGradient(
        this.x, this.y, this.width / 2,
        this.x, this.y, shieldRadius
      );
      gradient.addColorStop(0, "rgba(0, 150, 255, 0.3)");
      gradient.addColorStop(0.7, "rgba(0, 100, 255, 0.2)");
      gradient.addColorStop(1, "rgba(0, 50, 255, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + Math.sin(this.shieldPulse * 2) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, shieldRadius - 5, 0, Math.PI * 2);
      ctx.stroke();
      
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + this.shieldPulse * 0.5;
        const sparkX = this.x + Math.cos(angle) * (shieldRadius - 5);
        const sparkY = this.y + Math.sin(angle) * (shieldRadius - 5);
        
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.fillStyle = this.shieldActive ? "#4488cc" : "#666688";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.shieldActive ? "#224466" : "#444466";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = this.shieldActive ? "#66aaff" : "#888888";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Date.now() * 0.001;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2.5, angle, angle + 0.5);
      ctx.stroke();
    }
    
    ctx.fillStyle = this.shieldActive ? "#aaddff" : "#aaaaaa";
    ctx.beginPath();
    ctx.arc(this.x - 12, this.y - 8, 8, 0, Math.PI * 2);
    ctx.arc(this.x + 12, this.y - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(this.x - 12, this.y - 8, 4, 0, Math.PI * 2);
    ctx.arc(this.x + 12, this.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    if (!this.shieldActive) {
      const rechargePercent = this.shieldTimer / this.shieldCooldown;
      const barWidth = this.width * 0.8;
      const barHeight = 4;
      
      ctx.fillStyle = "#333333";
      ctx.fillRect(this.x - barWidth / 2, this.y + this.height / 2 + 5, barWidth, barHeight);
      
      ctx.fillStyle = "#0088ff";
      ctx.fillRect(this.x - barWidth / 2, this.y + this.height / 2 + 5, barWidth * rechargePercent, barHeight);
    }

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
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth, barHeight);

    ctx.fillStyle = "#44ff44";
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth * healthPercent, barHeight);
  }

  public takeDamage(amount: number): void {
    if (this.shieldActive) {
      return;
    }
    
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
    return "shielded";
  }

  public isShieldActive(): boolean {
    return this.shieldActive;
  }

  public getShieldProgress(): number {
    if (this.shieldActive) {
      return 1 - (this.shieldTimer / this.shieldDuration);
    } else {
      return this.shieldTimer / this.shieldCooldown;
    }
  }
}
