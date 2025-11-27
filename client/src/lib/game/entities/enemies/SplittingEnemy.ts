import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';

export class SplittingEnemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  private splitLevel: number;
  private maxSplitLevel: number = 2;
  private spawnQueue: SplittingEnemy[] = [];
  private scale: number;

  constructor(x: number, y: number, splitLevel: number = 0) {
    const baseSize = 90;
    const sizeMultiplier = 1 - (splitLevel * 0.3);
    const size = baseSize * sizeMultiplier;
    
    super(x, y, size, size);
    
    this.splitLevel = splitLevel;
    this.scale = sizeMultiplier;
    this.collisionWidth = size * 0.4;
    this.collisionHeight = size * 0.4;
    
    const healthMultiplier = Math.pow(0.33, splitLevel);
    const damageMultiplier = Math.pow(0.5, splitLevel);
    
    this.speed = 45 + (splitLevel * 15);
    this.health = Math.max(1, Math.floor(3 * healthMultiplier));
    this.maxHealth = this.health;
    this.damage = Math.max(5, Math.floor(20 * damageMultiplier));
    this.scoreValue = Math.max(5, Math.floor(30 / (splitLevel + 1)));
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.alive) return;

    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const wobble = Math.sin(Date.now() * 0.005 + this.x) * 0.3;
      const moveX = (dx / distance) * this.speed * deltaTime;
      const moveY = (dy / distance) * this.speed * deltaTime;

      this.x += moveX + wobble * deltaTime * 20;
      this.y += moveY;
    }
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.split();
    }
  }

  private split(): void {
    if (this.splitLevel >= this.maxSplitLevel) return;

    const numChildren = 2 + Math.floor(Math.random() * 2);
    const angleStep = (Math.PI * 2) / numChildren;
    const spreadDistance = 30;

    for (let i = 0; i < numChildren; i++) {
      const angle = angleStep * i + Math.random() * 0.5;
      const spawnX = this.x + Math.cos(angle) * spreadDistance;
      const spawnY = this.y + Math.sin(angle) * spreadDistance;
      
      const child = new SplittingEnemy(spawnX, spawnY, this.splitLevel + 1);
      this.spawnQueue.push(child);
    }
  }

  public getSpawnQueue(): SplittingEnemy[] {
    const queue = [...this.spawnQueue];
    this.spawnQueue = [];
    return queue;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    ctx.save();
    
    const wobbleX = Math.sin(Date.now() * 0.003) * 3 * this.scale;
    const wobbleY = Math.cos(Date.now() * 0.004) * 2 * this.scale;
    
    const hue = 120 - (this.splitLevel * 40);
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    
    ctx.beginPath();
    const blobPoints = 8;
    for (let i = 0; i <= blobPoints; i++) {
      const angle = (i / blobPoints) * Math.PI * 2;
      const radiusVariation = 1 + Math.sin(angle * 3 + Date.now() * 0.005) * 0.15;
      const radius = (this.width / 2) * radiusVariation;
      const px = this.x + wobbleX + Math.cos(angle) * radius;
      const py = this.y + wobbleY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = `hsl(${hue}, 60%, 30%)`;
    ctx.beginPath();
    ctx.arc(this.x + wobbleX, this.y + wobbleY, this.width / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    const eyeSize = 6 * this.scale;
    ctx.beginPath();
    ctx.arc(this.x + wobbleX - 10 * this.scale, this.y + wobbleY - 5 * this.scale, eyeSize, 0, Math.PI * 2);
    ctx.arc(this.x + wobbleX + 10 * this.scale, this.y + wobbleY - 5 * this.scale, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    const pupilSize = 3 * this.scale;
    ctx.beginPath();
    ctx.arc(this.x + wobbleX - 10 * this.scale, this.y + wobbleY - 5 * this.scale, pupilSize, 0, Math.PI * 2);
    ctx.arc(this.x + wobbleX + 10 * this.scale, this.y + wobbleY - 5 * this.scale, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.splitLevel > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = `${12 * this.scale}px Arial`;
      ctx.fillText(`×${this.splitLevel + 1}`, this.x + wobbleX - 6, this.y + wobbleY + 20 * this.scale);
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
    return "splitting";
  }

  public getSplitLevel(): number {
    return this.splitLevel;
  }

  public canSplit(): boolean {
    return this.splitLevel < this.maxSplitLevel;
  }
}
