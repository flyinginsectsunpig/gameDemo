import { GameObject } from "./Player";

export class OrbitalWeapon implements GameObject {
  public x: number = 0;
  public y: number = 0;
  public width = 12;
  public height = 12;
  private angle = 0;
  private radius = 50;
  private rotationSpeed = 2; // radians per second
  private damage = 3;
  private damageTimer = 0;
  private damageCooldown = 0.5; // seconds between damage ticks

  public update(deltaTime: number, playerX: number, playerY: number): { x: number; y: number } {
    this.angle += this.rotationSpeed * deltaTime;
    this.damageTimer += deltaTime;

    // Calculate orbital position
    this.x = playerX + Math.cos(this.angle) * this.radius;
    this.y = playerY + Math.sin(this.angle) * this.radius;

    return { x: this.x, y: this.y };
  }

  public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Draw orbital weapon as a spinning diamond
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle * 2);

    // Outer glow
    ctx.shadowColor = "#4444ff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(-6, -6, 12, 12);

    // Inner core
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#aaaaff";
    ctx.fillRect(-3, -3, 6, 6);

    ctx.restore();
  }

  public canDamage(): boolean {
    return this.damageTimer >= this.damageCooldown;
  }

  public dealDamage(): number {
    if (this.canDamage()) {
      this.damageTimer = 0;
      return this.damage;
    }
    return 0;
  }

  public getDamage(): number {
    return this.damage;
  }

  public upgrade() {
    this.damage += 1;
    this.rotationSpeed += 0.3;
    this.radius += 5;
  }
}