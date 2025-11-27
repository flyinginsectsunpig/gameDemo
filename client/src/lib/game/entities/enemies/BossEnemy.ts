import { Enemy } from './Enemy';
import { SpriteManager } from '../../rendering/SpriteManager';

export type BossType = "necromancer" | "vampire_lord" | "ancient_golem";

export interface AttackPattern {
  name: string;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  range: number;
  execute: (boss: BossEnemy, playerPos: { x: number; y: number }, deltaTime: number) => void;
}

export interface BossAbility {
  name: string;
  description: string;
  isActive: boolean;
  duration: number;
  currentDuration: number;
}

export class BossEnemy extends Enemy {
  private bossType: BossType;
  private attackPatterns: AttackPattern[] = [];
  private abilities: BossAbility[] = [];
  private phaseThreshold: number = 0.5;
  private currentPhase: number = 1;
  private bossName: string = "";
  private bossDescription: string = "";
  
  private isShielded: boolean = false;
  private shieldHealth: number = 0;
  private maxShieldHealth: number = 0;
  
  private dashVelocity: { x: number; y: number } = { x: 0, y: 0 };
  private isDashing: boolean = false;
  private dashDuration: number = 0;
  
  private summonCooldown: number = 0;
  private minionSpawnQueue: { x: number; y: number }[] = [];
  
  private lifeStealAmount: number = 0;
  private groundPoundActive: boolean = false;
  private groundPoundRadius: number = 0;
  private groundPoundDamage: number = 0;
  
  private phaseTransitionTimer: number = 0;
  private isInPhaseTransition: boolean = false;

  constructor(x: number, y: number, bossType: BossType, waveNumber: number = 5) {
    super(x, y, "tank");
    this.bossType = bossType;
    
    const stats = this.getBossStats(bossType, waveNumber);
    this.initializeBoss(stats);
    this.setupAttackPatterns();
    this.setupAbilities();
  }

  private getBossStats(bossType: BossType, waveNumber: number) {
    const scaleFactor = 1 + (waveNumber / 10);
    
    const bossStats = {
      necromancer: {
        name: "The Necromancer",
        description: "Master of death, commands the undead",
        health: 100 * scaleFactor,
        damage: 25 * scaleFactor,
        speed: 35,
        width: 180,
        height: 180,
        collisionWidth: 72,
        collisionHeight: 72,
        scoreValue: 500 * Math.floor(scaleFactor),
        color: "#6b21a8"
      },
      vampire_lord: {
        name: "Vampire Lord",
        description: "Ancient bloodsucker with supernatural speed",
        health: 80 * scaleFactor,
        damage: 35 * scaleFactor,
        speed: 55,
        width: 160,
        height: 160,
        collisionWidth: 64,
        collisionHeight: 64,
        scoreValue: 600 * Math.floor(scaleFactor),
        color: "#991b1b"
      },
      ancient_golem: {
        name: "Ancient Golem",
        description: "Stone guardian with impenetrable defense",
        health: 150 * scaleFactor,
        damage: 40 * scaleFactor,
        speed: 25,
        width: 220,
        height: 220,
        collisionWidth: 88,
        collisionHeight: 88,
        scoreValue: 700 * Math.floor(scaleFactor),
        color: "#78716c"
      }
    };

    return bossStats[bossType];
  }

  private initializeBoss(stats: ReturnType<typeof this.getBossStats>) {
    this.bossName = stats.name;
    this.bossDescription = stats.description;
    this.width = stats.width;
    this.height = stats.height;
    this.collisionWidth = stats.collisionWidth;
    this.collisionHeight = stats.collisionHeight;
    
    (this as any).health = stats.health;
    (this as any).maxHealth = stats.health;
    (this as any).damage = stats.damage;
    (this as any).speed = stats.speed;
    (this as any).scoreValue = stats.scoreValue;
  }

  private setupAttackPatterns() {
    switch (this.bossType) {
      case "necromancer":
        this.attackPatterns = [
          {
            name: "Summon Minions",
            cooldown: 8,
            currentCooldown: 3,
            damage: 0,
            range: 500,
            execute: (boss, playerPos) => {
              const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
              angles.forEach(angle => {
                const spawnX = boss.x + Math.cos(angle) * 100;
                const spawnY = boss.y + Math.sin(angle) * 100;
                boss.minionSpawnQueue.push({ x: spawnX, y: spawnY });
              });
            }
          },
          {
            name: "Dark Bolt",
            cooldown: 2,
            currentCooldown: 0,
            damage: 15,
            range: 300,
            execute: () => {}
          }
        ];
        break;

      case "vampire_lord":
        this.attackPatterns = [
          {
            name: "Blood Dash",
            cooldown: 4,
            currentCooldown: 2,
            damage: 30,
            range: 400,
            execute: (boss, playerPos) => {
              const dx = playerPos.x - boss.x;
              const dy = playerPos.y - boss.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0) {
                boss.dashVelocity = {
                  x: (dx / distance) * 500,
                  y: (dy / distance) * 500
                };
                boss.isDashing = true;
                boss.dashDuration = 0.3;
              }
            }
          },
          {
            name: "Life Steal Aura",
            cooldown: 6,
            currentCooldown: 4,
            damage: 20,
            range: 150,
            execute: (boss) => {
              boss.lifeStealAmount = 30;
            }
          }
        ];
        break;

      case "ancient_golem":
        this.attackPatterns = [
          {
            name: "Ground Pound",
            cooldown: 5,
            currentCooldown: 3,
            damage: 50,
            range: 200,
            execute: (boss) => {
              boss.groundPoundActive = true;
              boss.groundPoundRadius = 0;
              boss.groundPoundDamage = 50;
            }
          },
          {
            name: "Stone Shield",
            cooldown: 10,
            currentCooldown: 5,
            damage: 0,
            range: 0,
            execute: (boss) => {
              boss.isShielded = true;
              boss.shieldHealth = boss.getMaxHealth() * 0.3;
              boss.maxShieldHealth = boss.shieldHealth;
            }
          }
        ];
        break;
    }
  }

  private setupAbilities() {
    switch (this.bossType) {
      case "necromancer":
        this.abilities = [
          {
            name: "Death Aura",
            description: "Enemies near the Necromancer gain power",
            isActive: true,
            duration: -1,
            currentDuration: 0
          }
        ];
        break;

      case "vampire_lord":
        this.abilities = [
          {
            name: "Bloodlust",
            description: "Attacks heal the Vampire Lord",
            isActive: true,
            duration: -1,
            currentDuration: 0
          }
        ];
        break;

      case "ancient_golem":
        this.abilities = [
          {
            name: "Stone Skin",
            description: "Reduces incoming damage",
            isActive: true,
            duration: -1,
            currentDuration: 0
          }
        ];
        break;
    }
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    if (!this.isAlive()) return;

    if (this.isInPhaseTransition) {
      this.phaseTransitionTimer -= deltaTime;
      if (this.phaseTransitionTimer <= 0) {
        this.isInPhaseTransition = false;
        this.enterPhase2();
      }
      return;
    }

    this.checkPhaseTransition();
    this.updateAttackPatterns(deltaTime, playerPos);
    this.updateSpecialMechanics(deltaTime, playerPos);

    if (this.isDashing) {
      this.x += this.dashVelocity.x * deltaTime;
      this.y += this.dashVelocity.y * deltaTime;
      this.dashDuration -= deltaTime;
      if (this.dashDuration <= 0) {
        this.isDashing = false;
        this.dashVelocity = { x: 0, y: 0 };
      }
    } else {
      super.update(deltaTime, playerPos);
    }
  }

  private checkPhaseTransition() {
    const healthPercent = this.getHealth() / this.getMaxHealth();
    if (this.currentPhase === 1 && healthPercent <= this.phaseThreshold) {
      this.currentPhase = 2;
      this.isInPhaseTransition = true;
      this.phaseTransitionTimer = 1.5;
    }
  }

  private enterPhase2() {
    this.attackPatterns.forEach(pattern => {
      pattern.cooldown *= 0.7;
    });
    (this as any).speed *= 1.3;

    switch (this.bossType) {
      case "necromancer":
        const summonPattern = this.attackPatterns.find(p => p.name === "Summon Minions");
        if (summonPattern) {
          summonPattern.cooldown = 5;
        }
        break;

      case "vampire_lord":
        this.lifeStealAmount = 50;
        break;

      case "ancient_golem":
        this.isShielded = true;
        this.shieldHealth = this.getMaxHealth() * 0.5;
        this.maxShieldHealth = this.shieldHealth;
        break;
    }
  }

  private updateAttackPatterns(deltaTime: number, playerPos: { x: number; y: number }) {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    this.attackPatterns.forEach(pattern => {
      pattern.currentCooldown -= deltaTime;
      
      if (pattern.currentCooldown <= 0 && distanceToPlayer <= pattern.range) {
        pattern.execute(this, playerPos, deltaTime);
        pattern.currentCooldown = pattern.cooldown;
      }
    });
  }

  private updateSpecialMechanics(deltaTime: number, playerPos: { x: number; y: number }) {
    if (this.summonCooldown > 0) {
      this.summonCooldown -= deltaTime;
    }

    if (this.groundPoundActive) {
      this.groundPoundRadius += 300 * deltaTime;
      if (this.groundPoundRadius >= 200) {
        this.groundPoundActive = false;
        this.groundPoundRadius = 0;
      }
    }

    if (this.lifeStealAmount > 0) {
      this.lifeStealAmount -= deltaTime * 10;
      if (this.lifeStealAmount < 0) this.lifeStealAmount = 0;
    }
  }

  public takeDamage(amount: number): void {
    if (this.isInPhaseTransition) return;

    let actualDamage = amount;

    if (this.bossType === "ancient_golem") {
      actualDamage *= 0.7;
    }

    if (this.isShielded) {
      this.shieldHealth -= actualDamage;
      if (this.shieldHealth <= 0) {
        this.isShielded = false;
        actualDamage = Math.abs(this.shieldHealth);
        this.shieldHealth = 0;
      } else {
        return;
      }
    }

    super.takeDamage(actualDamage);

    if (this.lifeStealAmount > 0 && this.bossType === "vampire_lord") {
      const healAmount = actualDamage * 0.1;
      const currentHealth = this.getHealth();
      const maxHealth = this.getMaxHealth();
      (this as any).health = Math.min(currentHealth + healAmount, maxHealth);
    }
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.isAlive()) return;

    const bossColors = {
      necromancer: "#6b21a8",
      vampire_lord: "#991b1b",
      ancient_golem: "#78716c"
    };

    const baseColor = bossColors[this.bossType];
    
    ctx.save();
    
    if (this.isInPhaseTransition) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
      
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.groundPoundActive) {
      ctx.fillStyle = "rgba(139, 69, 19, 0.3)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.groundPoundRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#8b4513";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.fillStyle = baseColor;
    
    if (this.currentPhase === 2) {
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 20;
    }
    
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    this.renderBossDetails(ctx, baseColor);

    if (this.isShielded) {
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = "rgba(74, 222, 128, 0.2)";
      ctx.fill();
      
      const shieldPercent = this.shieldHealth / this.maxShieldHealth;
      const shieldBarWidth = this.width;
      ctx.fillStyle = "#166534";
      ctx.fillRect(this.x - shieldBarWidth / 2, this.y - this.height / 2 - 20, shieldBarWidth, 6);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(this.x - shieldBarWidth / 2, this.y - this.height / 2 - 20, shieldBarWidth * shieldPercent, 6);
    }

    if (this.isDashing && this.bossType === "vampire_lord") {
      ctx.fillStyle = "rgba(153, 27, 27, 0.5)";
      for (let i = 1; i <= 3; i++) {
        const trailX = this.x - this.dashVelocity.x * 0.02 * i;
        const trailY = this.y - this.dashVelocity.y * 0.02 * i;
        ctx.globalAlpha = 1 - (i * 0.25);
        ctx.fillRect(
          trailX - this.width / 2,
          trailY - this.height / 2,
          this.width,
          this.height
        );
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private renderBossDetails(ctx: CanvasRenderingContext2D, baseColor: string) {
    const iconSize = this.width * 0.4;
    
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${iconSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    let icon = "";
    switch (this.bossType) {
      case "necromancer":
        icon = "💀";
        break;
      case "vampire_lord":
        icon = "🧛";
        break;
      case "ancient_golem":
        icon = "🗿";
        break;
    }
    
    ctx.fillText(icon, this.x, this.y);

    if (this.currentPhase === 2) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 16px Arial";
      ctx.fillText("ENRAGED", this.x, this.y + this.height / 2 + 20);
    }
  }

  public getMinionSpawnQueue(): { x: number; y: number }[] {
    const queue = [...this.minionSpawnQueue];
    this.minionSpawnQueue = [];
    return queue;
  }

  public isGroundPounding(): boolean {
    return this.groundPoundActive;
  }

  public getGroundPoundRadius(): number {
    return this.groundPoundRadius;
  }

  public getGroundPoundDamage(): number {
    return this.groundPoundDamage;
  }

  public getBossType(): BossType {
    return this.bossType;
  }

  public getBossName(): string {
    return this.bossName;
  }

  public getBossDescription(): string {
    return this.bossDescription;
  }

  public getCurrentPhase(): number {
    return this.currentPhase;
  }

  public isInTransition(): boolean {
    return this.isInPhaseTransition;
  }

  public getType(): string {
    return `boss_${this.bossType}`;
  }
}
