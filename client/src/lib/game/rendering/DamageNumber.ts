
export class DamageNumber {
  public x: number;
  public y: number;
  private damage: number;
  private lifetime: number = 1;
  private maxLifetime: number = 1;
  private velocityY: number = -50;
  private isCritical: boolean;

  constructor(x: number, y: number, damage: number, isCritical: boolean = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y;
    this.damage = Math.ceil(damage);
    this.isCritical = isCritical;
  }

  public update(deltaTime: number): void {
    this.lifetime -= deltaTime;
    this.y += this.velocityY * deltaTime;
    this.velocityY += 100 * deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.lifetime / this.maxLifetime;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    ctx.font = this.isCritical ? "bold 24px Arial" : "bold 16px Arial";
    ctx.fillStyle = this.isCritical ? "#ff0000" : "#ffff00";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    
    if (this.isCritical) {
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 10;
    }

    const text = this.isCritical ? `${this.damage}!` : `${this.damage}`;
    ctx.strokeText(text, this.x, this.y);
    ctx.fillText(text, this.x, this.y);
    
    ctx.restore();
  }

  public isAlive(): boolean {
    return this.lifetime > 0;
  }
}

export class DamageNumberManager {
  private numbers: DamageNumber[] = [];

  public addDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false): void {
    this.numbers.push(new DamageNumber(x, y, damage, isCritical));
  }

  public update(deltaTime: number): void {
    this.numbers = this.numbers.filter(number => {
      number.update(deltaTime);
      return number.isAlive();
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.numbers.forEach(number => number.render(ctx));
  }

  public clear(): void {
    this.numbers = [];
  }
}
