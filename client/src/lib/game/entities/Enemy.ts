import { GameObject } from "./Player";
import { SpriteManager } from '../rendering/SpriteManager';

export class Enemy implements GameObject {
  public x: number;
  public y: number;
  public width = 80;
  public height = 80;
  public collisionWidth = 32; // Smaller collision box
  public collisionHeight = 32;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  private alive = true;
  private type: "basic" | "fast" | "tank";

  constructor(x: number, y: number, type: "basic" | "fast" | "tank" = "basic") {
    this.x = x;
    this.y = y;
    this.type = type;

    // Set properties based on enemy type
    switch (type) {
      case "fast":
        this.speed = 80;
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 15;
        this.scoreValue = 15;
        this.width = 70;
        this.height = 70;
        this.collisionWidth = 28;
        this.collisionHeight = 28;
        break;
      case "tank":
        this.speed = 30;
        this.health = 5;
        this.maxHealth = 5;
        this.damage = 30;
        this.scoreValue = 50;
        this.width = 120;
        this.height = 120;
        this.collisionWidth = 48;
        this.collisionHeight = 48;
        break;
      default: // basic
        this.speed = 50;
        this.health = 2;
        this.maxHealth = 2;
        this.damage = 20;
        this.scoreValue = 10;
        this.width = 80;
        this.height = 80;
        this.collisionWidth = 32;
        this.collisionHeight = 32;
        break;
    }
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    // Move towards player
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

  public takeDamage(damage: number) {
    this.health -= damage;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public getDamage(): number {
    return this.damage;
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();
    let spriteName = 'enemy_basic';
    let fallbackColor = "#ff4444";

    // Determine sprite and fallback color based on type
    if (this.speed > 60) {
      spriteName = 'enemy_fast';
      fallbackColor = "#ff8844"; // fast = orange
    } else if (this.maxHealth > 2) {
      spriteName = 'enemy_tank';
      fallbackColor = "#ff44ff"; // tank = magenta
    }

    const enemySprite = spriteManager.getSprite(spriteName);

    if (enemySprite) {
      // Draw static sprite
      ctx.drawImage(
        enemySprite,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback to colored squares if sprite not loaded
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }

    // Draw health bar if damaged
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;

      // Background
      ctx.fillStyle = "#333333";
      ctx.fillRect(
        this.x - barWidth / 2,
        this.y - this.height / 2 - 8,
        barWidth,
        barHeight
      );

      // Health
      ctx.fillStyle = "#44ff44";
      ctx.fillRect(
        this.x - barWidth / 2,
        this.y - this.height / 2 - 8,
        barWidth * healthPercent,
        barHeight
      );
    }
  }
}