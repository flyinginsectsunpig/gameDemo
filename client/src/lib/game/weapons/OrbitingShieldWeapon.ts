import { Enemy } from "../entities/enemies/Enemy";
import { WeaponRarity } from "./WeaponRarity";

interface Shield {
  angle: number;
  hitCooldowns: Map<Enemy, number>;
}

export class OrbitingShieldWeapon {
  private damage: number;
  private orbitRadius: number;
  private rotationSpeed: number;
  private shieldCount: number;
  private hitCooldown: number;
  private shields: Shield[] = [];
  private level: number = 1;
  private rarity: WeaponRarity = WeaponRarity.Common;
  private evolved: boolean = false;
  private shieldSize: number = 20;
  private blockedProjectiles: number = 0;

  constructor() {
    this.damage = 15;
    this.orbitRadius = 80;
    this.rotationSpeed = 2;
    this.shieldCount = 3;
    this.hitCooldown = 0.5;
    this.initializeShields();
  }

  private initializeShields(): void {
    this.shields = [];
    for (let i = 0; i < this.shieldCount; i++) {
      this.shields.push({
        angle: (i / this.shieldCount) * Math.PI * 2,
        hitCooldowns: new Map()
      });
    }
  }

  public update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number
  ): { enemy: Enemy; damage: number }[] {
    const hits: { enemy: Enemy; damage: number }[] = [];

    for (const shield of this.shields) {
      shield.angle += this.getEffectiveRotationSpeed() * deltaTime;
      
      shield.hitCooldowns.forEach((time, enemy) => {
        shield.hitCooldowns.set(enemy, time - deltaTime);
        if (time - deltaTime <= 0) {
          shield.hitCooldowns.delete(enemy);
        }
      });

      const shieldX = playerX + Math.cos(shield.angle) * this.getEffectiveRadius();
      const shieldY = playerY + Math.sin(shield.angle) * this.getEffectiveRadius();

      for (const enemy of enemies) {
        if (!enemy.isAlive() || enemy.getHealth() <= 0) continue;
        if (shield.hitCooldowns.has(enemy)) continue;

        const dx = enemy.x - shieldX;
        const dy = enemy.y - shieldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const hitRange = this.shieldSize + (enemy.width || 32) / 2;
        if (distance < hitRange) {
          hits.push({ enemy, damage: this.getBaseDamage() });
          shield.hitCooldowns.set(enemy, this.hitCooldown);

          if (this.evolved) {
            const knockbackForce = 50;
            const knockbackX = (dx / distance) * knockbackForce;
            const knockbackY = (dy / distance) * knockbackForce;
            enemy.x += knockbackX;
            enemy.y += knockbackY;
          }
        }
      }
    }

    if (this.shields.length < this.getEffectiveShieldCount()) {
      const diff = this.getEffectiveShieldCount() - this.shields.length;
      for (let i = 0; i < diff; i++) {
        const newAngle = (this.shields.length / this.getEffectiveShieldCount()) * Math.PI * 2;
        this.shields.push({
          angle: newAngle,
          hitCooldowns: new Map()
        });
      }
    }

    return hits;
  }

  public getShieldPositions(playerX: number, playerY: number): { x: number; y: number }[] {
    return this.shields.map(shield => ({
      x: playerX + Math.cos(shield.angle) * this.getEffectiveRadius(),
      y: playerY + Math.sin(shield.angle) * this.getEffectiveRadius()
    }));
  }

  public checkProjectileBlock(
    projectileX: number,
    projectileY: number,
    playerX: number,
    playerY: number
  ): boolean {
    for (const shield of this.shields) {
      const shieldX = playerX + Math.cos(shield.angle) * this.getEffectiveRadius();
      const shieldY = playerY + Math.sin(shield.angle) * this.getEffectiveRadius();

      const dx = projectileX - shieldX;
      const dy = projectileY - shieldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.shieldSize + 10) {
        this.blockedProjectiles++;
        return true;
      }
    }
    return false;
  }

  private getEffectiveRotationSpeed(): number {
    let speed = this.rotationSpeed + (this.level - 1) * 0.3;
    
    if (this.evolved) {
      speed *= 1.5;
    }

    return speed;
  }

  private getEffectiveRadius(): number {
    let radius = this.orbitRadius + (this.level - 1) * 10;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        radius *= 1.1;
        break;
      case WeaponRarity.Legendary:
        radius *= 1.2;
        break;
    }

    return radius;
  }

  private getEffectiveShieldCount(): number {
    let count = this.shieldCount + Math.floor((this.level - 1) / 2);
    
    switch (this.rarity) {
      case WeaponRarity.Legendary:
        count += 1;
        break;
    }

    if (this.evolved) {
      count += 2;
    }

    return Math.min(count, 8);
  }

  private getBaseDamage(): number {
    let baseDamage = this.damage + (this.level - 1) * 3;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        baseDamage *= 1.25;
        break;
      case WeaponRarity.Legendary:
        baseDamage *= 1.5;
        break;
    }

    if (this.evolved) {
      baseDamage *= 2;
    }

    return Math.floor(baseDamage);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    playerX: number,
    playerY: number,
    cameraX: number,
    cameraY: number
  ): void {
    const screenPlayerX = playerX - cameraX;
    const screenPlayerY = playerY - cameraY;

    ctx.save();

    ctx.strokeStyle = this.evolved ? "rgba(255, 215, 0, 0.3)" : "rgba(100, 149, 237, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(screenPlayerX, screenPlayerY, this.getEffectiveRadius(), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const shield of this.shields) {
      const shieldX = screenPlayerX + Math.cos(shield.angle) * this.getEffectiveRadius();
      const shieldY = screenPlayerY + Math.sin(shield.angle) * this.getEffectiveRadius();
      
      this.renderShield(ctx, shieldX, shieldY, shield.angle);
    }

    ctx.restore();
  }

  private renderShield(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    const baseColor = this.evolved ? "#FFD700" : "#6495ED";
    const glowColor = this.evolved ? "#FFA500" : "#87CEEB";
    const innerColor = this.evolved ? "#FFFFFF" : "#B0C4DE";

    ctx.shadowColor = baseColor;
    ctx.shadowBlur = this.evolved ? 20 : 12;

    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(0, -this.shieldSize);
    ctx.lineTo(this.shieldSize * 0.7, -this.shieldSize * 0.3);
    ctx.lineTo(this.shieldSize * 0.7, this.shieldSize * 0.5);
    ctx.lineTo(0, this.shieldSize);
    ctx.lineTo(-this.shieldSize * 0.7, this.shieldSize * 0.5);
    ctx.lineTo(-this.shieldSize * 0.7, -this.shieldSize * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.shieldSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    if (this.evolved) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-this.shieldSize * 0.4, -this.shieldSize * 0.2);
      ctx.lineTo(this.shieldSize * 0.4, -this.shieldSize * 0.2);
      ctx.moveTo(0, -this.shieldSize * 0.5);
      ctx.lineTo(0, this.shieldSize * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  public upgrade(): void {
    this.level = Math.min(this.level + 1, 5);
    this.damage += 3;
    this.shieldSize += 3;
    if (this.level === 3) {
      this.shieldCount = 4;
    }
    if (this.level === 5) {
      this.shieldCount = 5;
    }
  }

  public evolve(): void {
    if (this.level >= 5 && !this.evolved) {
      this.evolved = true;
      this.damage *= 2;
      this.shieldCount += 2;
      this.shieldSize *= 1.3;
      this.rotationSpeed *= 1.5;
      this.initializeShields();
    }
  }

  public getLevel(): number {
    return this.level;
  }

  public isEvolved(): boolean {
    return this.evolved;
  }

  public setRarity(rarity: WeaponRarity): void {
    this.rarity = rarity;
  }

  public getRarity(): WeaponRarity {
    return this.rarity;
  }

  public getBlockedProjectiles(): number {
    return this.blockedProjectiles;
  }

  public getName(): string {
    return this.evolved ? "Divine Aegis" : "Orbiting Shield";
  }

  public getDescription(): string {
    return this.evolved 
      ? "Impenetrable divine shields that devastate all who approach"
      : "Protective shields that orbit and damage nearby enemies";
  }
}
