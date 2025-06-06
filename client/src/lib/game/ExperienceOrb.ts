import { GameObject } from "./Player";

export class ExperienceOrb implements GameObject {
  public x: number;
  public y: number;
  public width = 8;
  public height = 8;
  private value: number;
  private lifetime = 10; // seconds before disappearing
  private attractRadius = 80;
  private collectRadius = 20;
  private attracted = false;
  private pulseTime = 0;

  constructor(x: number, y: number, value: number = 5) {
    this.x = x;
    this.y = y;
    this.value = value;
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    this.lifetime -= deltaTime;
    this.pulseTime += deltaTime * 3;

    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if player is within attraction radius
    if (distance <= this.attractRadius) {
      this.attracted = true;
    }

    // Move towards player if attracted
    if (this.attracted && distance > this.collectRadius) {
      const speed = 200; // pixels per second
      const moveX = (dx / distance) * speed * deltaTime;
      const moveY = (dy / distance) * speed * deltaTime;
      
      this.x += moveX;
      this.y += moveY;
    }
  }

  public isExpired(): boolean {
    return this.lifetime <= 0;
  }

  public canBeCollected(playerPos: { x: number; y: number }): boolean {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.collectRadius;
  }

  public getValue(): number {
    return this.value;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(this.pulseTime) * 0.3 + 1;
    const size = this.width * pulse;
    
    // Glow effect
    ctx.save();
    ctx.shadowColor = "#44ff44";
    ctx.shadowBlur = this.attracted ? 15 : 8;
    
    // Main orb
    ctx.fillStyle = "#44ff44";
    ctx.fillRect(
      this.x - size / 2,
      this.y - size / 2,
      size,
      size
    );

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#88ff88";
    ctx.fillRect(
      this.x - size / 4,
      this.y - size / 4,
      size / 2,
      size / 2
    );
    
    ctx.restore();

    // Lifetime indicator (only when low)
    if (this.lifetime < 3) {
      const lifetimePercent = this.lifetime / 3;
      ctx.fillStyle = "#333333";
      ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 1, this.width, 2);
      ctx.fillStyle = "#44ff44";
      ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 1, this.width * lifetimePercent, 2);
    }
  }
}