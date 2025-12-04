
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";

export class ThunderStrikeWeapon extends BaseWeapon {
  private strikeTimer: number = 0;
  private strikeInterval: number = 2;
  private strikeRadius: number = 150;
  private strikeDamage: number = 40;
  private lightningBolts: Array<{ x: number; y: number; lifetime: number }> = [];

  constructor() {
    super(40, 0.5, 0); // damage, fireRate, projectileSpeed
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.strikeTimer += deltaTime;

    if (this.strikeTimer >= this.strikeInterval && enemies.length > 0) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      if (randomEnemy && randomEnemy.isAlive()) {
        this.lightningBolts.push({
          x: randomEnemy.x,
          y: randomEnemy.y,
          lifetime: 0.3
        });

        enemies.forEach(enemy => {
          if (!enemy.isAlive()) return;
          const dx = enemy.x - randomEnemy.x;
          const dy = enemy.y - randomEnemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= this.strikeRadius) {
            enemy.takeDamage(this.strikeDamage);
          }
        });

        this.strikeTimer = 0;
      }
    }

    this.lightningBolts = this.lightningBolts.filter(bolt => {
      bolt.lifetime -= deltaTime;
      return bolt.lifetime > 0;
    });
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.lightningBolts.forEach(bolt => {
      ctx.save();
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ffff00";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(bolt.x, bolt.y - 500);
      
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = i * 100;
        ctx.lineTo(bolt.x + offsetX, bolt.y - 500 + offsetY);
      }
      
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, this.strikeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  public fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.strikeDamage += 10;
    this.strikeRadius += 20;
    this.strikeInterval = Math.max(0.5, this.strikeInterval * 0.9);
  }

  public getType(): string {
    return "thunder_strike";
  }
}
