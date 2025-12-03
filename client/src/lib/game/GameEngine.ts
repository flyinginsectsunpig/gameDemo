import { Player } from './entities/characters/Player';
import { AssassinPlayer } from './entities/characters/AssassinPlayer';
import { Enemy } from './entities/enemies/Enemy';
import { BossEnemy } from './entities/enemies/BossEnemy';
import { FlyingEnemy } from './entities/enemies/FlyingEnemy';
import { RangedEnemy } from './entities/enemies/RangedEnemy';
import { TeleportingEnemy } from './entities/enemies/TeleportingEnemy';
import { SplittingEnemy } from './entities/enemies/SplittingEnemy';
import { ShieldedEnemy } from './entities/enemies/ShieldedEnemy';
import { EnemyProjectile } from './entities/enemies/EnemyProjectile';
import { Projectile } from './weapons/projectiles/Projectile';
import { IProjectile } from './core/interfaces/IProjectile';
import { ExperienceOrb } from './entities/collectibles/ExperienceOrb';
import { SylphBloomsWeapon } from './weapons/SylphBloomsWeapon';
import { OrbitalWeapon } from './weapons/OrbitalWeapon';
import { CollisionDetection } from './systems/CollisionDetection';
import { WaveManager } from './managers/WaveManager';
import { SpriteManager } from './rendering/SpriteManager';
import { CameraSystem } from './rendering/CameraSystem';
import { InfiniteTileRenderer } from './rendering/InfiniteTileRenderer';
import { Particle } from './rendering/Particle';
import { InputManager } from './systems/InputManager';
import { useGameState } from "../stores/useGameState";
import { useAudio } from "../stores/useAudio";
import { useGameStore } from "../stores/useGame";
import { WeaponEvolutionSystem } from './systems/WeaponEvolution';
import { ComboSystem } from './systems/ComboSystem';
import { PassiveItemManager } from './entities/collectibles/PassiveItem';
import { DamageNumberManager } from './rendering/DamageNumber';
import { BossLoot, generateBossLoot } from './entities/collectibles/BossLoot';
import { ScreenShakeSystem } from './rendering/ScreenShake';
import { PersistentProgressionSystem } from './systems/PersistentProgressionSystem';
import { StatisticsSystem } from './systems/StatisticsSystem';
import { GameLoopController } from './systems/GameLoopController';
import { EntityManager } from './managers/EntityManager';
import { CollisionHandler } from './systems/CollisionHandler';
import { RenderSystem } from './rendering/RenderSystem';
import { GameStateManager } from './systems/GameStateManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Delegated systems
  private gameLoop: GameLoopController;
  private entityManager: EntityManager;
  private collisionHandler: CollisionHandler;
  private renderSystem: RenderSystem;
  private gameStateManager: GameStateManager;
  private waveManager: WaveManager;
  private inputManager: InputManager;
  private spriteManager: SpriteManager;
  private camera: CameraSystem;
  private infiniteTileRenderer: InfiniteTileRenderer;

  private currentBoss: BossEnemy | null = null;
  private isBossActive: boolean = false;
  private bossDefeatedCelebrationTimer: number = 0;
  private bossLoot: BossLoot[] = [];
  private gameStartTime: number = 0;
  private totalDamageDealt: number = 0;
  private totalDamageTaken: number = 0;
  private lastStatsSaveTime: number = 0;
  private readonly STATS_SAVE_INTERVAL: number = 30000;


  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.gameStartTime = Date.now();
    this.canvas = canvas;
    this.ctx = ctx;

    // Initialize core systems
    this.spriteManager = SpriteManager.getInstance();
    this.infiniteTileRenderer = new InfiniteTileRenderer();
    this.camera = new CameraSystem(canvas.width, canvas.height);
    this.inputManager = new InputManager();
    this.waveManager = new WaveManager();

    // Initialize delegated systems
    this.entityManager = new EntityManager(canvas, this.infiniteTileRenderer);
    this.gameStateManager = new GameStateManager();
    this.collisionHandler = new CollisionHandler(this.entityManager, this.gameStateManager);
    this.renderSystem = new RenderSystem(ctx, this.camera, this.infiniteTileRenderer, this.entityManager);
    this.renderSystem.setGameStateManager(this.gameStateManager);
    this.gameLoop = new GameLoopController(this.update.bind(this), this.render.bind(this));

    this.setupBossCallbacks();
    this.setupInput();
    this.initializeSprites();
  }

  private setupBossCallbacks() {
    this.waveManager.setOnBossWarning(() => {
      this.gameStateManager.handleBossWarning(this.waveManager.getCurrentWave());
    });

    this.waveManager.setOnBossSpawn((boss) => {
      this.entityManager.addBoss(boss);
      this.gameStateManager.handleBossSpawn(boss);
      this.currentBoss = boss; // Keep track of the current boss for logic within GameEngine if needed
      this.isBossActive = true;
    });
  }

  private setupInput() {
    this.inputManager.addEventListeners();
    // GameStateManager now handles its own input setup for pause, restart, etc.
    this.gameStateManager.setupInputHandlers(this.inputManager, () => this.resetGame());
  }

  private resetGame() {
    this.entityManager.reset();
    this.waveManager.reset();
    this.gameStateManager.reset();
    this.entityManager.setupPlayer(); // Ensure player is re-initialized
    this.currentBoss = null;
    this.isBossActive = false;
    this.bossLoot = [];
    this.gameStartTime = Date.now();
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.lastStatsSaveTime = 0;
  }

  public start() {
    this.gameLoop.start();
  }

  public stop() {
    this.gameLoop.stop();
    this.inputManager.removeEventListeners();
  }

  private update = (deltaTime: number) => {
    const gameState = useGameState.getState(); // Still needed for some read operations

    // Handle pause/resume
    const input = this.inputManager.getInput();
    if (this.gameStateManager.handlePauseInput(input)) {
      // Player input for pause is handled internally by GameStateManager now.
      // If it returns true, it means pause state changed, so we might want to stop updates.
      if (gameState.phase === "paused" || gameState.phase === "gameOver") {
        return;
      }
    }

    // Don't update game if paused or game over
    if (gameState.phase === "paused" || gameState.phase === "gameOver") {
      return;
    }

    // Periodically save session stats during gameplay
    const now = Date.now();
    if (now - this.lastStatsSaveTime >= this.STATS_SAVE_INTERVAL) {
      this.saveCurrentSessionStats();
    }

    // Check for player death
    if (this.gameStateManager.checkPlayerDeath()) {
      this.handlePlayerDeath();
      return;
    }

    const player = this.entityManager.getPlayer();

    // Update player
    player.update(deltaTime, this.inputManager.getInput(), this.canvas.width, this.canvas.height, this.infiniteTileRenderer);

    // Update camera
    this.camera.update(player.x + player.width / 2, player.y + player.height / 2, deltaTime);
    if (this.camera.width !== this.canvas.width || this.camera.height !== this.canvas.height) {
      this.camera.setSize(this.canvas.width, this.canvas.height);
    }

    // Update wave system and spawn enemies
    this.waveManager.update(deltaTime);
    const newEnemies = this.waveManager.spawnEnemies(this.canvas.width, this.canvas.height, player.getPosition());
    this.entityManager.addEnemies(newEnemies);

    gameState.setWave(this.waveManager.getCurrentWave());

    // Update all entities managed by EntityManager
    this.entityManager.update(deltaTime, player.getPosition());

    // Handle collisions
    this.collisionHandler.handleAllCollisions();

    // Update game state specific logic (like combo, screen shake, etc.)
    this.gameStateManager.update(deltaTime);

    // Handle boss defeat logic
    if (this.currentBoss && !this.currentBoss.isAlive() && this.isBossActive) {
      this.handleBossDefeated();
    }
  }

  private handlePlayerDeath() {
    const player = this.entityManager.getPlayer();
    this.gameStateManager.handlePlayerDeath(
      player,
      () => {
        this.entityManager.createDeathParticles(player.x, player.y);
        // Also handle player death specific particle effects if any
      },
      this.totalDamageDealt,
      this.totalDamageTaken,
      this.gameStartTime
    );
    // Potentially clear session stats snapshot here or let GameStateManager handle it
  }

  private handleBossDefeated() {
    this.gameStateManager.handleBossDefeated(this.currentBoss!, this.entityManager.getExperienceOrbs(), this.entityManager.getBossLoot());
    this.currentBoss = null;
    this.isBossActive = false;
  }

  private saveCurrentSessionStats() {
    const gameState = useGameState.getState();
    const player = this.entityManager.getPlayer();
    const characterId = gameState.selectedCharacter?.id || "guardian";

    this.gameStateManager.saveCurrentSessionStats(
      characterId,
      this.gameStartTime,
      this.totalDamageDealt,
      this.totalDamageTaken
    );
    this.lastStatsSaveTime = Date.now();
  }

  private render = (deltaTime: number) => {
    // RenderSystem handles all rendering logic
    this.renderSystem.render(deltaTime);
  }

  private async initializeSprites() {
    await this.spriteManager.loadAllSprites();
  }

  public getPlayer() {
    return this.entityManager.getPlayer();
  }

  public getEnemies() {
    return this.entityManager.getEnemies().map(enemy => ({
      x: enemy.x,
      y: enemy.y,
      isBoss: enemy instanceof BossEnemy // Check against BossEnemy class directly
    }));
  }
}