
import { Player } from '../entities/characters/Player';
import { AssassinPlayer } from '../entities/characters/AssassinPlayer';
import { IEnemy } from '../core/interfaces/IEnemy';
import { IProjectile } from '../core/interfaces/IProjectile';
import { BossEnemy } from '../entities/enemies/BossEnemy';
import { Enemy } from '../entities/enemies/Enemy';
import { RangedEnemy } from '../entities/enemies/RangedEnemy';
import { SplittingEnemy } from '../entities/enemies/SplittingEnemy';
import { EnemyProjectile } from '../entities/enemies/EnemyProjectile';
import { ExperienceOrb } from '../entities/collectibles/ExperienceOrb';
import { BossLoot } from '../entities/collectibles/BossLoot';
import { Particle } from '../rendering/Particle';
import { DamageNumberManager } from '../rendering/DamageNumber';
import { PassiveItemManager } from '../entities/collectibles/PassiveItem';
import { InfiniteTileRenderer } from '../rendering/InfiniteTileRenderer';
import { useGameState } from '../../stores/useGameState';

export class EntityManager {
  private player: Player | AssassinPlayer;
  private enemies: IEnemy[] = [];
  private projectiles: IProjectile[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private particles: Particle[] = [];
  private experienceOrbs: ExperienceOrb[] = [];
  private bossLoot: BossLoot[] = [];
  private currentBoss: BossEnemy | null = null;
  
  private damageNumbers: DamageNumberManager;
  private passiveItems: PassiveItemManager;
  private tileRenderer: InfiniteTileRenderer;

  constructor(canvas: HTMLCanvasElement, tileRenderer: InfiniteTileRenderer) {
    this.tileRenderer = tileRenderer;
    this.player = new Player(canvas.width / 2, canvas.height / 2);
    this.damageNumbers = new DamageNumberManager();
    this.passiveItems = new PassiveItemManager();
  }

  public reset() {
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.experienceOrbs = [];
    this.bossLoot = [];
    this.currentBoss = null;
  }

  public setupPlayer() {
    const gameState = useGameState.getState();
    const character = gameState.selectedCharacter;
    const centerX = this.player.x;
    const centerY = this.player.y;

    if (character?.id === "assassin") {
      this.player = new AssassinPlayer(centerX, centerY);
    } else {
      this.player = new Player(centerX, centerY);
    }
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, playerPos);
      
      if (enemy instanceof RangedEnemy) {
        const newProjectiles = enemy.getProjectiles();
        this.enemyProjectiles.push(...newProjectiles);
      }
    });

    // Update boss
    if (this.currentBoss && this.currentBoss.isAlive()) {
      this.handleBossUpdate(deltaTime);
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      p.update(deltaTime);
      return p.isAlive();
    });

    this.enemyProjectiles = this.enemyProjectiles.filter(p => {
      p.update(deltaTime);
      return p.isAlive();
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      return p.isAlive();
    });

    // Update damage numbers
    this.damageNumbers.update(deltaTime);

    // Apply passive effects
    this.passiveItems.applyEffects(this.player);

    // Update collectibles
    this.experienceOrbs = this.experienceOrbs.filter(orb => {
      orb.update(deltaTime, playerPos);
      return !orb.isExpired();
    });

    this.bossLoot = this.bossLoot.filter(loot => {
      loot.update(deltaTime, playerPos);
      return !loot.isCollected();
    });

    // Handle splitting enemies
    this.handleSplittingEnemies();

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
  }

  private handleBossUpdate(deltaTime: number) {
    const gameState = useGameState.getState();
    if (!this.currentBoss) return;

    gameState.updateBossHealth(this.currentBoss.getHealth(), this.currentBoss.getMaxHealth());
    
    const minionSpawns = this.currentBoss.getMinionSpawnQueue();
    minionSpawns.forEach(spawn => {
      const minion = new Enemy(spawn.x, spawn.y, "basic");
      this.enemies.push(minion);
    });
  }

  private handleSplittingEnemies() {
    const newSplitEnemies: SplittingEnemy[] = [];
    
    this.enemies.forEach(enemy => {
      if (enemy instanceof SplittingEnemy && !enemy.isAlive()) {
        const spawns = enemy.getSpawnQueue();
        newSplitEnemies.push(...spawns);
      }
    });
    
    newSplitEnemies.forEach(splitEnemy => {
      this.enemies.push(splitEnemy as unknown as IEnemy);
      this.createSplitParticles(splitEnemy.x, splitEnemy.y);
    });
  }

  public addBoss(boss: BossEnemy) {
    this.currentBoss = boss;
    this.enemies.push(boss);
  }

  public addEnemies(enemies: IEnemy[]) {
    enemies.forEach(enemy => {
      if (enemy instanceof BossEnemy) {
        this.currentBoss = enemy;
      }
      this.enemies.push(enemy);
    });
  }

  public addProjectile(projectile: IProjectile) {
    this.projectiles.push(projectile);
  }

  public addProjectiles(projectiles: IProjectile[]) {
    this.projectiles.push(...projectiles);
  }

  public addParticle(particle: Particle) {
    this.particles.push(particle);
  }

  public addExperienceOrb(orb: ExperienceOrb) {
    this.experienceOrbs.push(orb);
  }

  public addBossLoot(loot: BossLoot[]) {
    this.bossLoot.push(...loot);
  }

  public createDeathParticles(x: number, y: number) {
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 60,
        y + (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        Math.random() > 0.5 ? "#ff0000" : "#880000",
        1.5
      ));
    }
  }

  public createHitParticles(x: number, y: number, color = "#ffff44") {
    for (let i = 0; i < 3; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        color,
        0.5
      ));
    }
  }

  private createSplitParticles(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        "#44ff44",
        0.5
      ));
    }
  }

  public addDamageNumber(x: number, y: number, damage: number, isCritical: boolean) {
    this.damageNumbers.addDamageNumber(x, y, damage, isCritical);
  }

  // Getters
  public getPlayer() { return this.player; }
  public getEnemies() { return this.enemies; }
  public getProjectiles() { return this.projectiles; }
  public getEnemyProjectiles() { return this.enemyProjectiles; }
  public getParticles() { return this.particles; }
  public getExperienceOrbs() { return this.experienceOrbs; }
  public getBossLoot() { return this.bossLoot; }
  public getCurrentBoss() { return this.currentBoss; }
  public getDamageNumbers() { return this.damageNumbers; }
}
