import { Enemy } from "../entities/enemies/Enemy";
import { WeaponRarity } from "./WeaponRarity";

interface LightningChain {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  alpha: number;
  thickness: number;
}

export class LightningChainWeapon {
  private damage: number;
  private cooldown: number;
  private chainCount: number;
  private chainDamageMultiplier: number;
  private chainRange: number;
  private lastFireTime: number = 0;
  private activeChains: LightningChain[] = [];
  private chainDecayRate: number = 3;
  private level: number = 1;
  private rarity: WeaponRarity = WeaponRarity.Common;
  private evolved: boolean = false;

  constructor() {
    this.damage = 25;
    this.cooldown = 2;
    this.chainCount = 3;
    this.chainDamageMultiplier = 0.8;
    this.chainRange = 150;
  }

  public update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number
  ): { enemy: Enemy; damage: number }[] {
    this.lastFireTime += deltaTime;

    this.activeChains = this.activeChains.filter(chain => {
      chain.alpha -= this.chainDecayRate * deltaTime;
      return chain.alpha > 0;
    });

    if (this.lastFireTime < this.cooldown) {
      return [];
    }

    const aliveEnemies = enemies.filter(e => e.isAlive() && e.getHealth() > 0);
    if (aliveEnemies.length === 0) {
      return [];
    }

    this.lastFireTime = 0;
    const hits: { enemy: Enemy; damage: number }[] = [];
    const hitEnemies = new Set<Enemy>();

    const firstTarget = this.findNearestEnemy(aliveEnemies, playerX, playerY, 300);
    if (!firstTarget) {
      return [];
    }

    let currentDamage = this.getBaseDamage();
    hits.push({ enemy: firstTarget, damage: currentDamage });
    hitEnemies.add(firstTarget);

    this.activeChains.push({
      startX: playerX,
      startY: playerY,
      endX: firstTarget.x,
      endY: firstTarget.y,
      alpha: 1,
      thickness: this.evolved ? 4 : 2
    });

    let lastX = firstTarget.x;
    let lastY = firstTarget.y;
    const maxChains = this.evolved ? this.chainCount + 2 : this.chainCount;

    for (let i = 0; i < maxChains; i++) {
      currentDamage *= this.chainDamageMultiplier;
      
      const remainingEnemies = aliveEnemies.filter(e => !hitEnemies.has(e));
      const nextTarget = this.findNearestEnemy(remainingEnemies, lastX, lastY, this.chainRange);
      
      if (!nextTarget) break;

      hits.push({ enemy: nextTarget, damage: Math.floor(currentDamage) });
      hitEnemies.add(nextTarget);

      this.activeChains.push({
        startX: lastX,
        startY: lastY,
        endX: nextTarget.x,
        endY: nextTarget.y,
        alpha: 1,
        thickness: this.evolved ? 3 : 2
      });

      lastX = nextTarget.x;
      lastY = nextTarget.y;
    }

    return hits;
  }

  private findNearestEnemy(
    enemies: Enemy[],
    x: number,
    y: number,
    maxRange: number
  ): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDistance = maxRange;

    for (const enemy of enemies) {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  private getBaseDamage(): number {
    let baseDamage = this.damage + (this.level - 1) * 5;
    
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

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const chain of this.activeChains) {
      this.renderLightningBolt(ctx, chain, cameraX, cameraY);
    }
  }

  private renderLightningBolt(
    ctx: CanvasRenderingContext2D,
    chain: LightningChain,
    cameraX: number,
    cameraY: number
  ): void {
    const startX = chain.startX - cameraX;
    const startY = chain.startY - cameraY;
    const endX = chain.endX - cameraX;
    const endY = chain.endY - cameraY;

    ctx.save();
    ctx.globalAlpha = chain.alpha;

    const color = this.evolved ? "#FFD700" : "#00BFFF";
    const glowColor = this.evolved ? "#FFA500" : "#87CEEB";

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = chain.thickness;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const segments = 8;
    const dx = (endX - startX) / segments;
    const dy = (endY - startY) / segments;
    const jitter = 10;

    for (let i = 1; i < segments; i++) {
      const x = startX + dx * i + (Math.random() - 0.5) * jitter;
      const y = startY + dy * i + (Math.random() - 0.5) * jitter;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = chain.thickness * 0.5;
    ctx.shadowBlur = 5;
    ctx.stroke();

    ctx.restore();
  }

  public upgrade(): void {
    this.level = Math.min(this.level + 1, 5);
    this.damage += 5;
    this.chainRange += 20;
    if (this.level >= 3) {
      this.chainCount = Math.min(this.chainCount + 1, 5);
    }
  }

  public evolve(): void {
    if (this.level >= 5 && !this.evolved) {
      this.evolved = true;
      this.damage *= 2;
      this.chainCount += 2;
      this.cooldown *= 0.7;
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
    return this.evolved ? "Thunder God" : "Lightning Chain";
  }

  public getDescription(): string {
    return this.evolved 
      ? "Divine lightning strikes multiple foes with devastating power"
      : "Chain lightning jumps between enemies";
  }
}
