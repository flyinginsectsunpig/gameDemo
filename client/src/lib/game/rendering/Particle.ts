export class Particle {
  public x: number;
  public y: number;
  private vx: number;
  private vy: number;
  private color: string;
  private life: number;
  private maxLife: number;
  private size: number;

  constructor(x: number, y: number, vx: number, vy: number, color: string, life: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 3 + 1;
  }

  public update(deltaTime: number) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Apply gravity and friction
    this.vy += 200 * deltaTime; // gravity
    this.vx *= 0.98; // friction
    this.vy *= 0.98;

    this.life -= deltaTime;
  }

  public isAlive(): boolean {
    return this.life > 0;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive()) return;

    const alpha = this.life / this.maxLife;
    const currentSize = this.size * alpha;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - currentSize / 2,
      this.y - currentSize / 2,
      currentSize,
      currentSize
    );
    ctx.restore();
  }
}
