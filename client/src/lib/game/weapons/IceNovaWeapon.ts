import { Enemy } from "../entities/enemies/Enemy";
import { WeaponRarity } from "./WeaponRarity";

interface SlowEffect {
  enemy: Enemy;
  remainingTime: number;
  slowMultiplier: number;
  originalSpeed: number;
}

interface NovaWave {
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  alpha: number;
  hitEnemies: Set<Enemy>;
}

export class IceNovaWeapon {
  private damage: number;
  private cooldown: number;
  private novaRadius: number;
  private slowAmount: number;
  private slowDuration: number;
  private lastFireTime: number = 0;
  private activeNovas: NovaWave[] = [];
  private slowEffects: Map<Enemy, SlowEffect> = new Map();
  private level: number = 1;
  private rarity: WeaponRarity = WeaponRarity.Common;
  private evolved: boolean = false;
  private novaExpansionSpeed: number = 300;

  constructor() {
    this.damage = 20;
    this.cooldown = 4;
    this.novaRadius = 200;
    this.slowAmount = 0.5;
    this.slowDuration = 3;
  }

  public update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number
  ): { enemy: Enemy; damage: number }[] {
    this.lastFireTime += deltaTime;
    const hits: { enemy: Enemy; damage: number }[] = [];

    this.updateSlowEffects(deltaTime);
    this.updateNovas(deltaTime, enemies, hits);

    if (this.lastFireTime >= this.getEffectiveCooldown()) {
      this.lastFireTime = 0;
      this.createNova(playerX, playerY);
    }

    return hits;
  }

  private createNova(x: number, y: number): void {
    const maxRadius = this.getEffectiveRadius();
    
    this.activeNovas.push({
      x,
      y,
      currentRadius: 0,
      maxRadius,
      alpha: 1,
      hitEnemies: new Set()
    });

    if (this.evolved) {
      setTimeout(() => {
        this.activeNovas.push({
          x,
          y,
          currentRadius: 0,
          maxRadius: maxRadius * 0.7,
          alpha: 1,
          hitEnemies: new Set()
        });
      }, 200);
    }
  }

  private updateNovas(
    deltaTime: number,
    enemies: Enemy[],
    hits: { enemy: Enemy; damage: number }[]
  ): void {
    this.activeNovas = this.activeNovas.filter(nova => {
      nova.currentRadius += this.novaExpansionSpeed * deltaTime;

      for (const enemy of enemies) {
        if (!enemy.isAlive() || enemy.getHealth() <= 0) continue;
        if (nova.hitEnemies.has(enemy)) continue;

        const dx = enemy.x - nova.x;
        const dy = enemy.y - nova.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= nova.currentRadius && distance >= nova.currentRadius - 30) {
          nova.hitEnemies.add(enemy);
          hits.push({ enemy, damage: this.getBaseDamage() });
          this.applySlow(enemy);
        }
      }

      if (nova.currentRadius >= nova.maxRadius) {
        nova.alpha -= deltaTime * 2;
      }

      return nova.alpha > 0;
    });
  }

  private updateSlowEffects(deltaTime: number): void {
    for (const [enemy, slow] of this.slowEffects) {
      if (!enemy.isAlive() || enemy.getHealth() <= 0) {
        this.slowEffects.delete(enemy);
        continue;
      }

      slow.remainingTime -= deltaTime;

      if (slow.remainingTime <= 0) {
        this.slowEffects.delete(enemy);
      }
    }
  }

  private applySlow(enemy: Enemy): void {
    const existingSlow = this.slowEffects.get(enemy);
    const slowMult = this.evolved ? this.slowAmount * 1.5 : this.slowAmount;
    const slowTime = this.evolved ? this.slowDuration * 1.5 : this.slowDuration;

    if (existingSlow) {
      existingSlow.remainingTime = slowTime;
    } else {
      this.slowEffects.set(enemy, {
        enemy,
        remainingTime: slowTime,
        slowMultiplier: slowMult,
        originalSpeed: 1
      });
    }
  }

  public isEnemySlowed(enemy: Enemy): boolean {
    return this.slowEffects.has(enemy);
  }

  public getSlowMultiplier(enemy: Enemy): number {
    const slow = this.slowEffects.get(enemy);
    return slow ? slow.slowMultiplier : 1;
  }

  private getEffectiveCooldown(): number {
    let cd = this.cooldown - (this.level - 1) * 0.3;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        cd *= 0.9;
        break;
      case WeaponRarity.Legendary:
        cd *= 0.8;
        break;
    }

    if (this.evolved) {
      cd *= 0.7;
    }

    return Math.max(cd, 1);
  }

  private getEffectiveRadius(): number {
    let radius = this.novaRadius + (this.level - 1) * 30;
    
    switch (this.rarity) {
      case WeaponRarity.Rare:
        radius *= 1.15;
        break;
      case WeaponRarity.Legendary:
        radius *= 1.3;
        break;
    }

    if (this.evolved) {
      radius *= 1.5;
    }

    return radius;
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

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number
  ): void {
    ctx.save();

    for (const nova of this.activeNovas) {
      this.renderNova(ctx, nova, cameraX, cameraY);
    }

    for (const [enemy, slow] of this.slowEffects) {
      if (enemy.isAlive()) {
        this.renderSlowEffect(ctx, enemy.x - cameraX, enemy.y - cameraY, slow);
      }
    }

    ctx.restore();
  }

  private renderNova(
    ctx: CanvasRenderingContext2D,
    nova: NovaWave,
    cameraX: number,
    cameraY: number
  ): void {
    const screenX = nova.x - cameraX;
    const screenY = nova.y - cameraY;

    ctx.globalAlpha = nova.alpha * 0.7;

    const baseColor = this.evolved ? "#00FFFF" : "#87CEEB";
    const innerColor = this.evolved ? "#FFFFFF" : "#B0E0E6";

    const gradient = ctx.createRadialGradient(
      screenX, screenY, Math.max(0, nova.currentRadius - 20),
      screenX, screenY, nova.currentRadius
    );
    gradient.addColorStop(0, "rgba(135, 206, 235, 0)");
    gradient.addColorStop(0.5, `${baseColor}80`);
    gradient.addColorStop(1, `${innerColor}40`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, nova.currentRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = this.evolved ? 4 : 2;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(screenX, screenY, nova.currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    const crystalCount = 8;
    for (let i = 0; i < crystalCount; i++) {
      const angle = (i / crystalCount) * Math.PI * 2;
      const x = screenX + Math.cos(angle) * nova.currentRadius;
      const y = screenY + Math.sin(angle) * nova.currentRadius;
      
      ctx.fillStyle = innerColor;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSlowEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    slow: SlowEffect
  ): void {
    const alpha = Math.min(slow.remainingTime / this.slowDuration, 1);
    
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = "#87CEEB";
    
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      const size = 2 + Math.random() * 3;
      
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y + offsetY - size);
      ctx.lineTo(x + offsetX + size * 0.5, y + offsetY);
      ctx.lineTo(x + offsetX, y + offsetY + size);
      ctx.lineTo(x + offsetX - size * 0.5, y + offsetY);
      ctx.closePath();
      ctx.fill();
    }
  }

  public upgrade(): void {
    this.level = Math.min(this.level + 1, 5);
    this.damage += 5;
    this.novaRadius += 30;
    this.slowDuration += 0.5;
  }

  public evolve(): void {
    if (this.level >= 5 && !this.evolved) {
      this.evolved = true;
      this.damage *= 2;
      this.novaRadius *= 1.5;
      this.slowAmount = 0.75;
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
    return this.evolved ? "Blizzard" : "Ice Nova";
  }

  public getDescription(): string {
    return this.evolved 
      ? "Unleashes a devastating blizzard that freezes all in its path"
      : "Releases a freezing wave that slows enemies";
  }
}
import { BaseWeapon } from "../core/base/BaseWeapon";
import { IProjectile } from "../core/interfaces/IProjectile";
import { Enemy } from "../entities/enemies/Enemy";

interface IceNova {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  lifetime: number;
  active: boolean;
}

interface SlowEffect {
  enemy: Enemy;
  remainingTime: number;
  slowMultiplier: number;
}

export class IceNovaWeapon extends BaseWeapon {
  private novas: IceNova[] = [];
  private cooldown: number = 5;
  private cooldownTimer: number = 0;
  private novaRadius: number = 200;
  private novaDamage: number = 30;
  private slowAmount: number = 0.5;
  private slowDuration: number = 3;
  private slowEffects: Map<Enemy, SlowEffect> = new Map();

  constructor() {
    super(30, 0.2, 0);
    this.damage = 30;
  }

  public update(deltaTime: number, enemies: any[], playerX: number, playerY: number): void {
    this.cooldownTimer += deltaTime;

    if (this.cooldownTimer >= this.cooldown) {
      this.novas.push({
        x: playerX,
        y: playerY,
        radius: 0,
        maxRadius: this.novaRadius,
        lifetime: 0.5,
        active: true
      });
      this.cooldownTimer = 0;
    }

    this.novas = this.novas.filter(nova => {
      if (!nova.active) return false;

      nova.radius += (nova.maxRadius / nova.lifetime) * deltaTime;
      nova.lifetime -= deltaTime;

      if (nova.lifetime <= 0) {
        nova.active = false;
        return false;
      }

      enemies.forEach((enemy: any) => {
        if (!enemy.isAlive()) return;
        const dx = enemy.x - nova.x;
        const dy = enemy.y - nova.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= nova.radius && distance >= nova.radius - 30) {
          enemy.takeDamage(this.novaDamage * deltaTime);
          this.applySlow(enemy);
        }
      });

      return true;
    });

    this.slowEffects.forEach((effect, enemy) => {
      effect.remainingTime -= deltaTime;
      if (effect.remainingTime <= 0 || !enemy.isAlive()) {
        this.slowEffects.delete(enemy);
      }
    });
  }

  private applySlow(enemy: Enemy): void {
    const existingSlow = this.slowEffects.get(enemy);
    if (existingSlow) {
      existingSlow.remainingTime = this.slowDuration;
    } else {
      this.slowEffects.set(enemy, {
        enemy,
        remainingTime: this.slowDuration,
        slowMultiplier: this.slowAmount
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    this.novas.forEach(nova => {
      const alpha = nova.lifetime / 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;

      const gradient = ctx.createRadialGradient(nova.x, nova.y, 0, nova.x, nova.y, nova.radius);
      gradient.addColorStop(0, "rgba(100, 200, 255, 0)");
      gradient.addColorStop(0.7, "rgba(100, 200, 255, 0.8)");
      gradient.addColorStop(1, "rgba(150, 220, 255, 0.4)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nova.x, nova.y, nova.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(200, 240, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nova.x, nova.y, nova.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  public fire(x: number, y: number, direction: { x: number; y: number }): IProjectile[] {
    return [];
  }

  public upgrade(): void {
    this.novaDamage += 10;
    this.novaRadius += 30;
    this.cooldown = Math.max(2, this.cooldown - 0.5);
    this.slowAmount = Math.min(0.8, this.slowAmount + 0.05);
  }

  public getType(): string {
    return "ice_nova";
  }

  public isEnemySlowed(enemy: Enemy): boolean {
    return this.slowEffects.has(enemy);
  }

  public getSlowMultiplier(enemy: Enemy): number {
    const effect = this.slowEffects.get(enemy);
    return effect ? effect.slowMultiplier : 1;
  }
}
