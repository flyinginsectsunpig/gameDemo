import { GameObject } from "./Player";

export class Projectile implements GameObject {
  public x: number;
  public y: number;
  public width = 8;
  public height = 8;
  public vx: number;
  public vy: number;
  private damage: number;
  private alive = true;
  private lifetime = 8; // seconds
  private piercing = false;
  private hitCount = 0;
  private maxHits = 1;
  private isSylphOrb = false;

  constructor(x: number, y: number, vx: number, vy: number, damage: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }

  public update(deltaTime: number) {
    if (!this.alive) return;

    // Ensure deltaTime is valid and reasonable (cap at 1/30th second to prevent large jumps)
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) && deltaTime > 0 ? 
      Math.min(deltaTime, 1/30) : 0.016;

    // Update position
    this.x += this.vx * validDeltaTime;
    this.y += this.vy * validDeltaTime;

    // Debug logging for first few frames to verify movement
    if (this.lifetime > 2.9 && this.lifetime < 3.0) {
      console.log(`Projectile position: (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), velocity: (${this.vx.toFixed(1)}, ${this.vy.toFixed(1)})`);
    }

    this.lifetime -= validDeltaTime;
    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy() {
    this.alive = false;
  }

  public getDamage(): number {
    return this.damage;
  }

  public setSylphOrb(isSylph: boolean) {
    this.isSylphOrb = isSylph;
  }

  public isSylphOrbProjectile(): boolean {
    return this.isSylphOrb;
  }

  public isPiercing(): boolean {
    return this.piercing;
  }

  public setPiercing(piercing: boolean, maxHits: number = 3) {
    this.piercing = piercing;
    this.maxHits = maxHits;
  }

  public isSylph(): boolean {
    return this.isSylphOrb;
  }

  public addHit(): boolean {
    if (this.piercing) {
      this.hitCount++;
      if (this.hitCount >= this.maxHits) {
        this.destroy();
        return true; // Projectile should be destroyed
      }
      return false; // Projectile continues
    } else {
      this.destroy();
      return true; // Regular projectile is destroyed after one hit
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();

    if (this.isSylphOrb) {
      // Render Sylph Orb with magical pink/purple glow
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;

      // Outer glow
      ctx.shadowColor = "#e91e63";
      ctx.shadowBlur = 15;
      ctx.fillStyle = `rgba(233, 30, 99, ${pulse})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.width / 2 + 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.width / 4, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle trail effect
      if (Math.random() < 0.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
        ctx.beginPath();
        ctx.arc(
          screenX + (Math.random() - 0.5) * 10,
          screenY + (Math.random() - 0.5) * 10,
          1,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (this.damage >= 1.5) {
      // Render magical emerald energy bolt - make it bigger
      // Outer glow
      ctx.shadowColor = "#50c878";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#50c878";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#90ee90";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle effect
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(screenX - 2, screenY - 2, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Regular projectile - make it much larger and more visible
      const size = 8; // Increased from 4

      // Bright yellow projectile
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(
        screenX - size / 2,
        screenY - size / 2,
        size,
        size
      );

      // Add a bright white center
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        screenX - 2,
        screenY - 2,
        4,
        4
      );

      // Add bright red outline for maximum visibility
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        screenX - size / 2,
        screenY - size / 2,
        size,
        size
      );

      // Add additional glow effect
      ctx.shadowColor = "#ffff00";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}