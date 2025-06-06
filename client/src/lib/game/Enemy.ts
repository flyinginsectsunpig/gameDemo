import { GameObject } from "./Player";

export class Enemy implements GameObject {
  public x: number;
  public y: number;
  public width = 16;
  public height = 16;
  private speed: number;
  private health: number;
  private maxHealth: number;
  private damage: number;
  private scoreValue: number;
  private alive = true;

  constructor(x: number, y: number, type: "basic" | "fast" | "tank" = "basic") {
    this.x = x;
    this.y = y;

    // Set properties based on enemy type
    switch (type) {
      case "fast":
        this.speed = 80;
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 15;
        this.scoreValue = 15;
        this.width = 12;
        this.height = 12;
        break;
      case "tank":
        this.speed = 30;
        this.health = 5;
        this.maxHealth = 5;
        this.damage = 30;
        this.scoreValue = 50;
        this.width = 24;
        this.height = 24;
        break;
      default: // basic
        this.speed = 50;
        this.health = 2;
        this.maxHealth = 2;
        this.damage = 20;
        this.scoreValue = 10;
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

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;

    // Determine color based on type
    let color = "#ff4444"; // basic = red
    if (this.speed > 60) color = "#ff8844"; // fast = orange
    if (this.maxHealth > 2) color = "#ff44ff"; // tank = magenta

    // Draw enemy
    ctx.fillStyle = color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

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
