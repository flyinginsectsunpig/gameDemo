import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';

export class TeleportingEnemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  
  private teleportTimer: number = 0;
  private teleportCooldown: number = 3.5;
  private isTelegraphing: boolean = false;
  private telegraphTimer: number = 0;
  private telegraphDuration: number = 0.8;
  private teleportTargetX: number = 0;
  private teleportTargetY: number = 0;
  private justTeleported: boolean = false;
  private postTeleportAttackWindow: number = 0;
  private attackWindowDuration: number = 1.5;
  private opacity: number = 1;

  constructor(x: number, y: number) {
    super(x, y, 75, 75);
    this.collisionWidth = 30;
    this.collisionHeight = 30;
    
    this.speed = 0;
    this.health = 2;
    this.maxHealth = 2;
    this.damage = 35;
    this.scoreValue = 35;
    
    this.teleportCooldown = 3 + Math.random();
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.alive) return;

    if (this.justTeleported) {
      this.postTeleportAttackWindow += deltaTime;
      if (this.postTeleportAttackWindow >= this.attackWindowDuration) {
        this.justTeleported = false;
        this.postTeleportAttackWindow = 0;
      }
    }

    if (this.isTelegraphing) {
      this.telegraphTimer += deltaTime;
      this.opacity = 0.3 + Math.sin(this.telegraphTimer * 20) * 0.3;
      
      if (this.telegraphTimer >= this.telegraphDuration) {
        this.executeTeleport();
      }
    } else {
      this.teleportTimer += deltaTime;
      this.opacity = Math.min(1, this.opacity + deltaTime * 2);
      
      if (this.teleportTimer >= this.teleportCooldown) {
        this.startTelegraph(playerPos);
      }
    }
  }

  private startTelegraph(playerPos: { x: number; y: number }): void {
    this.isTelegraphing = true;
    this.telegraphTimer = 0;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    this.teleportTargetX = playerPos.x + Math.cos(angle) * distance;
    this.teleportTargetY = playerPos.y + Math.sin(angle) * distance;
  }

  private executeTeleport(): void {
    this.x = this.teleportTargetX;
    this.y = this.teleportTargetY;
    this.isTelegraphing = false;
    this.teleportTimer = 0;
    this.justTeleported = true;
    this.postTeleportAttackWindow = 0;
    this.opacity = 1;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    if (this.isTelegraphing) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(this.teleportTargetX, this.teleportTargetY, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(this.teleportTargetX, this.teleportTargetY, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = this.justTeleported ? "#ff4444" : "#00cccc";
    
    const centerX = this.x;
    const centerY = this.y;
    const size = this.width / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX + size * 0.7, centerY - size * 0.3);
    ctx.lineTo(centerX + size, centerY);
    ctx.lineTo(centerX + size * 0.7, centerY + size * 0.3);
    ctx.lineTo(centerX, centerY + size);
    ctx.lineTo(centerX - size * 0.7, centerY + size * 0.3);
    ctx.lineTo(centerX - size, centerY);
    ctx.lineTo(centerX - size * 0.7, centerY - size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = this.justTeleported ? "#ffaaaa" : "#66ffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 8, this.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 8, this.y - 5, 2, 0, Math.PI * 2);
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
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth, barHeight);

    ctx.fillStyle = "#44ff44";
    ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 12, barWidth * healthPercent, barHeight);
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
    return this.justTeleported ? this.damage * 1.5 : this.damage;
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }

  public getType(): string {
    return "teleporting";
  }

  public isTeleporting(): boolean {
    return this.isTelegraphing;
  }

  public hasJustTeleported(): boolean {
    return this.justTeleported;
  }
}
