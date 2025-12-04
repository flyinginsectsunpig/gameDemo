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
import { PlayerFactory, PlayerType } from '../factories/PlayerFactory';

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
  private canvas: HTMLCanvasElement; // Added canvas property

  constructor(canvas: HTMLCanvasElement, tileRenderer: InfiniteTileRenderer) {
    this.canvas = canvas; // Initialize canvas property
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

  public setupPlayer(characterType?: PlayerType) {
    const gameState = useGameState.getState();
    
    // Clean up old player's spiders from tile renderer if switching/resetting
    if (this.player && typeof (this.player as any).getSpiders === 'function') {
      const oldSpiders = (this.player as any).getSpiders();
      oldSpiders.forEach((spider: any) => {
        if (spider.instanceId) {
          this.tileRenderer.removeSpider(spider.instanceId);
        }
      });
    }
    
    // Extract the ID if it's a character object, otherwise use the string directly
    let selectedChar: PlayerType = 'sylph';

    if (characterType) {
      selectedChar = characterType as PlayerType;
    } else if (gameState.selectedCharacter) {
      // Handle both object with id property and direct string
      selectedChar = (typeof gameState.selectedCharacter === 'object'
        ? gameState.selectedCharacter.id
        : gameState.selectedCharacter) as PlayerType;
    }

    this.player = PlayerFactory.createPlayer(
      selectedChar,
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    // Set tile renderer for weapons that need it (like SylphBloomsWeapon)
    const weapon = this.player.getWeapon();
    if (weapon && typeof (weapon as any).setTileRenderer === 'function') {
      (weapon as any).setTileRenderer(this.tileRenderer);
    }

    // Set tile renderer for AssassinPlayer if applicable
    if (typeof (this.player as any).setTileRenderer === 'function') {
      (this.player as any).setTileRenderer(this.tileRenderer);
    }
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    // Update player weapon if it has special update logic (like SylphBloomsWeapon)
    const weapon = this.player.getWeapon();
    if (weapon && typeof (weapon as any).update === 'function') {
      (weapon as any).update(deltaTime, this.enemies, playerPos.x, playerPos.y);
    }

    // Update AssassinPlayer spiders if applicable
    if (typeof (this.player as any).updateSpiders === 'function') {
      (this.player as any).updateSpiders(deltaTime, this.enemies, playerPos);
    }

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
