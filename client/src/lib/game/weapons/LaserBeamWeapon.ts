
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";

interface LaserBeam {
  angle: number;
  length: number;
  active: boolean;
  rotationSpeed: number;
}

export class LaserBeamWeapon extends BaseWeapon {
  private beams: LaserBeam[] = [];
  private beamCount: number = 1;
  private beamLength: number = 300;
  private beamDamage: number = 15;
  private rotationSpeed: number = 2;

  constructor() {
    super(15, 1, 0); // damage, fireRate, projectileSpeed
    
    this.beams.push({
      angle: 0,
      length: this.beamLength,
      active: true,
      rotationSpeed: this.rotationSpeed
    });
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.beams.forEach(beam => {
      beam.angle += beam.rotationSpeed * deltaTime;
      
      enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const distanceToEnemy = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceToEnemy > beam.length) return;

        const angleToEnemy = Math.atan2(dy, dx);
        let angleDiff = Math.abs(beam.angle - angleToEnemy);
        
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        angleDiff = Math.abs(angleDiff);

        if (angleDiff < 0.1) {
          enemy.takeDamage(this.beamDamage * deltaTime);
        }
      });
    });
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, playerX: number, playerY: number): void {
    this.beams.forEach(beam => {
      ctx.save();
      
      const endX = playerX + Math.cos(beam.angle) * beam.length;
      const endY = playerY + Math.sin(beam.angle) * beam.length;

      const gradient = ctx.createLinearGradient(playerX, playerY, endX, endY);
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 100, 100, 0.6)");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(playerX, playerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.restore();
    });
  }

  public fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.beamDamage += 5;
    this.beamLength += 50;
    
    if (this.beams.length < 4) {
      this.beams.push({
        angle: Math.random() * Math.PI * 2,
        length: this.beamLength,
        active: true,
        rotationSpeed: this.rotationSpeed
      });
    }
  }

  public getType(): string {
    return "laser_beam";
  }

  public getBeams(): LaserBeam[] {
    return this.beams;
  }
}
