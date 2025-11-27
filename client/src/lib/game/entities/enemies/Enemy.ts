
import { BaseEntity } from '../../core/base/BaseEntity';
import { IEnemy } from '../../core/interfaces/IEnemy';
import { SpriteManager } from '../../rendering/SpriteManager';

export type EnemyType = "basic" | "fast" | "tank";

export class Enemy extends BaseEntity implements IEnemy {
  public collisionWidth: number;
  public collisionHeight: number;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  private type: EnemyType;

  constructor(x: number, y: number, type: EnemyType = "basic") {
    super(x, y, 80, 80);
    this.type = type;
    this.collisionWidth = 32;
    this.collisionHeight = 32;

    const stats = this.getStatsForType(type);
    this.speed = stats.speed;
    this.health = stats.health;
    this.maxHealth = stats.maxHealth;
    this.damage = stats.damage;
    this.scoreValue = stats.scoreValue;
    this.width = stats.width;
    this.height = stats.height;
    this.collisionWidth = stats.collisionWidth;
    this.collisionHeight = stats.collisionHeight;
  }

  private getStatsForType(type: EnemyType) {
    const statsMap = {
      fast: {
        speed: 80,
        health: 1,
        maxHealth: 1,
        damage: 15,
        scoreValue: 15,
        width: 70,
        height: 70,
        collisionWidth: 28,
        collisionHeight: 28
      },
      tank: {
        speed: 30,
        health: 5,
        maxHealth: 5,
        damage: 30,
        scoreValue: 50,
        width: 120,
        height: 120,
        collisionWidth: 48,
        collisionHeight: 48
      },
      basic: {
        speed: 50,
        health: 2,
        maxHealth: 2,
        damage: 20,
        scoreValue: 10,
        width: 80,
        height: 80,
        collisionWidth: 32,
        collisionHeight: 32
      }
    };

    return statsMap[type];
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
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();
    const { spriteName, fallbackColor } = this.getSpriteInfo();
    const sprite = spriteManager.getSprite(spriteName);

    if (sprite) {
      ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    if (this.health < this.maxHealth) {
      this.renderHealthBar(ctx);
    }
  }

  private getSpriteInfo(): { spriteName: string; fallbackColor: string } {
    if (this.speed > 60) {
      return { spriteName: 'enemy_fast', fallbackColor: "#ff8844" };
    } else if (this.maxHealth > 2) {
      return { spriteName: 'enemy_tank', fallbackColor: "#ff44ff" };
    }
    return { spriteName: 'enemy_basic', fallbackColor: "#ff4444" };
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
    return this.type;
  }
}
