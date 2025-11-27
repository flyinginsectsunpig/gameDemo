import { Enemy } from "../entities/enemies/Enemy";
import { WeaponRarity } from "./WeaponRarity";

interface BurnEffect {
  enemy: Enemy;
  remainingTime: number;
  damagePerTick: number;
  tickTimer: number;
}

export class FireAuraWeapon {
  private damage: number;
  private range: number;
  private tickInterval: number;
  private burnDuration: number;
  private burnDamagePerTick: number;
  private lastTickTime: number = 0;
  private activeRadius: number = 0;
  private burnEffects: Map<Enemy, BurnEffect> = new Map();
  private level: number = 1;
  private rarity: WeaponRarity = WeaponRarity.Common;
  private evolved: boolean = false;
  private pulsePhase: number = 0;

  constructor() {
    this.damage = 5;
    this.range = 100;
    this.tickInterval = 0.5;
    this.burnDuration = 3;
    this.burnDamagePerTick = 2;
  }

  public update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number
  ): { enemy: Enemy; damage: number }[] {
    this.lastTickTime += deltaTime;
    this.pulsePhase += deltaTime * 3;

    const hits: { enemy: Enemy; damage: number }[] = [];

    this.updateBurnEffects(deltaTime, hits);

    if (this.lastTickTime >= this.tickInterval) {
      this.lastTickTime = 0;

      const effectiveRange = this.getEffectiveRange();
      this.activeRadius = effectiveRange;

      for (const enemy of enemies) {
        if (!enemy.isAlive() || enemy.getHealth() <= 0) continue;

        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= effectiveRange) {
          const auraDamage = this.getBaseDamage();
          hits.push({ enemy, damage: auraDamage });

          this.applyBurn(enemy);
        }
      }
    }

    return hits;
  }

  private updateBurnEffects(
    deltaTime: number,
    hits: { enemy: Enemy; damage: number }[]
  ): void {
    const burnTickInterval = 0.5;

    for (const [enemy, burn] of this.burnEffects) {
      if (!enemy.isAlive() || enemy.getHealth() <= 0) {
        this.burnEffects.delete(enemy);
        continue;
      }

      burn.remainingTime -= deltaTime;
      burn.tickTimer += deltaTime;

      if (burn.tickTimer >= burnTickInterval) {
        burn.tickTimer = 0;
        hits.push({ enemy, damage: burn.damagePerTick });
      }

      if (burn.remainingTime <= 0) {
        this.burnEffects.delete(enemy);
      }
    }
  }

  private applyBurn(enemy: Enemy): void {
    const burnDamage = this.evolved 
      ? this.burnDamagePerTick * 2 
      : this.burnDamagePerTick;
    
    const burnTime = this.evolved 
      ? this.burnDuration * 1.5 
      : this.burnDuration;

    this.burnEffects.set(enemy, {
      enemy,
      remainingTime: burnTime,
      damagePerTick: burnDamage + Math.floor(this.level * 0.5),
      tickTimer: 0
    });
  }

  private getEffectiveRange(): number {
    let range = this.range + (this.level - 1) * 15;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        range *= 1.2;
        break;
      case WeaponRarity.Legendary:
        range *= 1.4;
        break;
    }

    if (this.evolved) {
      range *= 1.5;
    }

    return range;
  }

  private getBaseDamage(): number {
    let baseDamage = this.damage + (this.level - 1) * 2;
    
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
    const screenX = playerX - cameraX;
    const screenY = playerY - cameraY;
    const effectiveRange = this.getEffectiveRange();

    ctx.save();

    const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
    const baseColor = this.evolved ? "#FF4500" : "#FF6B35";
    const innerColor = this.evolved ? "#FFD700" : "#FF8C00";

    const gradient = ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, effectiveRange
    );
    gradient.addColorStop(0, `rgba(255, 200, 0, ${0.3 * pulse})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.2 * pulse})`);
    gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, effectiveRange, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6 * pulse;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(screenX, screenY, effectiveRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const [enemy, burn] of this.burnEffects) {
      if (enemy.isAlive()) {
        this.renderBurnEffect(ctx, enemy.x - cameraX, enemy.y - cameraY, burn);
      }
    }

    ctx.restore();
  }

  private renderBurnEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    burn: BurnEffect
  ): void {
    const alpha = Math.min(burn.remainingTime / this.burnDuration, 1);
    
    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20 - 10;
      const size = 4 + Math.random() * 4;
      
      const gradient = ctx.createRadialGradient(
        x + offsetX, y + offsetY, 0,
        x + offsetX, y + offsetY, size
      );
      gradient.addColorStop(0, "#FFD700");
      gradient.addColorStop(0.5, "#FF4500");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  public upgrade(): void {
    this.level = Math.min(this.level + 1, 5);
    this.damage += 2;
    this.range += 15;
    this.burnDamagePerTick += 1;
  }

  public evolve(): void {
    if (this.level >= 5 && !this.evolved) {
      this.evolved = true;
      this.damage *= 2;
      this.range *= 1.5;
      this.burnDuration *= 1.5;
      this.burnDamagePerTick *= 2;
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

  public getName(): string {
    return this.evolved ? "Inferno" : "Fire Aura";
  }

  public getDescription(): string {
    return this.evolved 
      ? "A devastating inferno that incinerates all nearby foes"
      : "Burns enemies that get too close";
  }
}
