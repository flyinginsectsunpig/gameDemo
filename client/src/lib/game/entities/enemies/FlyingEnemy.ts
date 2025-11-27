import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';

export class FlyingEnemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  
  private sineOffset: number = 0;
  private sineAmplitude: number = 50;
  private sineFrequency: number = 3;
  private baseY: number = 0;
  private swoopTimer: number = 0;
  private swoopCooldown: number = 4;
  private isSwooping: boolean = false;
  private swoopDuration: number = 0.8;
  private swoopProgress: number = 0;
  private swoopStartY: number = 0;
  private swoopTargetY: number = 0;
  public ignoresTerrain: boolean = true;

  constructor(x: number, y: number) {
    super(x, y, 60, 60);
    this.baseY = y;
    this.collisionWidth = 24;
    this.collisionHeight = 24;
    
    this.speed = 90;
    this.health = 1;
    this.maxHealth = 1;
    this.damage = 15;
    this.scoreValue = 20;
    
    this.sineOffset = Math.random() * Math.PI * 2;
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.alive) return;

    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!this.isSwooping) {
      if (distance > 0) {
        const moveX = (dx / distance) * this.speed * deltaTime;
        this.x += moveX;
        this.baseY += (dy / distance) * this.speed * deltaTime * 0.3;
      }

      this.sineOffset += this.sineFrequency * deltaTime;
      this.y = this.baseY + Math.sin(this.sineOffset) * this.sineAmplitude;

      this.swoopTimer += deltaTime;
      if (this.swoopTimer >= this.swoopCooldown && distance < 200) {
        this.startSwoop(playerPos);
      }
    } else {
      this.swoopProgress += deltaTime / this.swoopDuration;
      
      if (this.swoopProgress >= 1) {
        this.isSwooping = false;
        this.swoopProgress = 0;
        this.swoopTimer = 0;
        this.baseY = this.y;
      } else {
        const swoopCurve = Math.sin(this.swoopProgress * Math.PI);
        this.y = this.swoopStartY + (this.swoopTargetY - this.swoopStartY) * swoopCurve;
        
        if (distance > 0) {
          this.x += (dx / distance) * this.speed * 1.5 * deltaTime;
        }
      }
    }
  }

  private startSwoop(playerPos: { x: number; y: number }): void {
    this.isSwooping = true;
    this.swoopProgress = 0;
    this.swoopStartY = this.y;
    this.swoopTargetY = playerPos.y;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    ctx.save();
    
    ctx.fillStyle = this.isSwooping ? "#ff6600" : "#ff9944";
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2);
    ctx.lineTo(this.x - this.width / 2, this.y);
    ctx.lineTo(this.x - this.width / 4, this.y + this.height / 4);
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.x + this.width / 4, this.y + this.height / 4);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 5, 4, 0, Math.PI * 2);
    ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
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
    return this.damage;
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }

  public getType(): string {
    return "flying";
  }

  public isSwoopingState(): boolean {
    return this.isSwooping;
  }
}
