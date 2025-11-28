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

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player | AssassinPlayer;
  private enemies: Enemy[] = [];
  private projectiles: IProjectile[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private particles: Particle[] = [];
  private experienceOrbs: ExperienceOrb[] = [];
  private waveManager: WaveManager;
  private collisionDetection: CollisionDetection;
  private inputManager: InputManager;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private lastMuteState = false;
  private lastRestartState = false;
  private lastPauseState = false;
  private lastWeapon1State = false;
  private lastWeapon2State = false;
  private lastWeapon3State = false;
  private lastWeapon4State = false;
  private lastWeapon5State = false;
  private spriteManager: SpriteManager;
  private infiniteTileRenderer: InfiniteTileRenderer;
  private camera: CameraSystem;

  private currentBoss: BossEnemy | null = null;
  private isBossActive: boolean = false;
  private bossDefeatedCelebrationTimer: number = 0;
  private weaponEvolution: WeaponEvolutionSystem;
  private passiveItems: PassiveItemManager;
  private damageNumbers: DamageNumberManager;
  private bossLoot: BossLoot[] = [];
  private comboSystem: ComboSystem;
  private gameStartTime: number = 0;
  private totalDamageDealt: number = 0;
  private totalDamageTaken: number = 0;
  private screenShake: ScreenShakeSystem;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.gameStartTime = Date.now();
    this.canvas = canvas;
    this.ctx = ctx;

    this.player = new Player(canvas.width / 2, canvas.height / 2);
    this.waveManager = new WaveManager();
    this.collisionDetection = new CollisionDetection();
    this.inputManager = new InputManager();
    this.spriteManager = SpriteManager.getInstance();
    this.infiniteTileRenderer = new InfiniteTileRenderer();
    this.camera = new CameraSystem(canvas.width, canvas.height);
    this.weaponEvolution = new WeaponEvolutionSystem();
    this.passiveItems = new PassiveItemManager();
    this.damageNumbers = new DamageNumberManager();
    this.comboSystem = new ComboSystem();
    this.screenShake = new ScreenShakeSystem();

    this.setupBossCallbacks();
    this.setupInput();
    this.initializeSprites();
  }

  private setupBossCallbacks() {
    this.waveManager.setOnBossWarning(() => {
      const wave = this.waveManager.getCurrentWave();
      const bossTypes = ["necromancer", "vampire_lord", "ancient_golem"];
      const bossIndex = Math.floor((wave / 5) - 1) % bossTypes.length;
      
      const bossInfo = {
        necromancer: { name: "The Necromancer", description: "Master of death, commands the undead" },
        vampire_lord: { name: "Vampire Lord", description: "Ancient bloodsucker with supernatural speed" },
        ancient_golem: { name: "Ancient Golem", description: "Stone guardian with impenetrable defense" }
      };
      
      const info = bossInfo[bossTypes[bossIndex] as keyof typeof bossInfo];
      const gameState = useGameState.getState();
      gameState.triggerBossWarning(info.name, info.description);
    });

    this.waveManager.setOnBossSpawn((boss: BossEnemy) => {
      this.currentBoss = boss;
      this.isBossActive = true;
      
      const gameState = useGameState.getState();
      gameState.setBossActive(true);
      gameState.setBossInfo(boss.getBossName(), boss.getBossDescription());
      gameState.updateBossHealth(boss.getHealth(), boss.getMaxHealth());
      
      console.log(`Boss spawned: ${boss.getBossName()}`);
    });
  }

  private setupInput() {
    const handleStart = () => {
      const gameState = useGameState.getState();
      if (gameState.phase === "ready") {
        gameState.start();
        const audioState = useAudio.getState();
        if (audioState.backgroundMusic && !audioState.isMuted) {
          audioState.backgroundMusic.play().catch(console.warn);
        }
      }
    };

    const handleRestart = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        const gameState = useGameState.getState();
        if (gameState.phase === "gameOver" || gameState.phase === "playing") {
          gameState.restart();
          this.resetGame();
        }
      }
    };

    const handleSoundToggle = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        const audioState = useAudio.getState();
        audioState.toggleMute();

        if (audioState.backgroundMusic) {
          if (audioState.isMuted) {
            audioState.backgroundMusic.pause();
          } else {
            audioState.backgroundMusic.play().catch(console.warn);
          }
        }
      }
    };

    const handleWindowBlur = () => {
      const gameState = useGameState.getState();
      if (gameState.phase === "playing") {
        gameState.pause();
      }
    };

    document.addEventListener("keydown", handleStart);
    document.addEventListener("click", handleStart);
    document.addEventListener("keydown", handleRestart);
    document.addEventListener("keydown", handleSoundToggle);
    window.addEventListener("blur", handleWindowBlur);

    this.inputManager.addEventListeners();
  }

  private resetGame() {
    this.setupPlayer();
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.experienceOrbs = [];
    this.bossLoot = [];
    this.currentBoss = null;
    this.isBossActive = false;
    this.bossDefeatedCelebrationTimer = 0;
    this.waveManager.reset();
    
    // Reset statistics tracking
    this.gameStartTime = Date.now();
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.comboSystem = new ComboSystem();
    
    const gameState = useGameState.getState();
    gameState.setBossActive(false);
    gameState.hideBossWarning();
    gameState.resetCombo();
    
    // Sync persistent currency with game state
    const persistentData = PersistentProgressionSystem.load();
    useGameState.setState({ currency: persistentData.currency });
  }

  public start() {
    this.gameLoop(0);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.inputManager.removeEventListeners();
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.02);
    this.lastTime = currentTime;

    const gameState = useGameState.getState();

    if (gameState.selectedCharacter && gameState.phase === "playing") {
      const isAssassin = gameState.selectedCharacter.id === "assassin";
      const hasAssassinPlayer = this.player instanceof AssassinPlayer;

      if (isAssassin && !hasAssassinPlayer) {
        this.setupPlayer();
      } else if (!isAssassin && hasAssassinPlayer) {
        this.setupPlayer();
      }
    }

    if (gameState.phase === "playing") {
      this.update(deltaTime);
    }

    this.render(deltaTime);
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public getPlayer() {
    return this.player;
  }

  public getEnemies() {
    return this.enemies.map(enemy => ({
      x: enemy.x,
      y: enemy.y,
      isBoss: enemy instanceof BossEnemy
    }));
  }

  private update(deltaTime: number) {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    const input = this.inputManager.getInput();
    
    // Update game store with current player and enemies data
    useGameStore.getState().updateGameData();

    // Handle pause
    if (input.pause && !this.lastPauseState) {
      if (gameState.phase === "playing") {
        gameState.pause();
      } else if (gameState.phase === "paused") {
        gameState.resume();
      }
    }
    this.lastPauseState = input.pause;

    // Don't update game if paused or game over
    if (gameState.phase === "paused" || gameState.phase === "gameOver") {
      return;
    }

    // Check for player death
    if (gameState.health <= 0 && gameState.phase === "playing") {
      this.handlePlayerDeath();
      return;
    }

    this.player.update(deltaTime, input, this.canvas.width, this.canvas.height, this.infiniteTileRenderer);

    if (this.player instanceof AssassinPlayer) {
      this.player.setTileRenderer(this.infiniteTileRenderer);
      this.player.updateSpiders(deltaTime, this.enemies, this.player.getPosition());
      this.handleSpiderKills();
    }

    this.camera.update(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, deltaTime);

    if (this.camera.width !== this.canvas.width || this.camera.height !== this.canvas.height) {
      this.camera.setSize(this.canvas.width, this.canvas.height);
    }

    this.waveManager.update(deltaTime);
    const playerPos = this.player.getPosition();
    const newEnemies = this.waveManager.spawnEnemies(this.canvas.width, this.canvas.height, playerPos);
    
    newEnemies.forEach(enemy => {
      if (enemy instanceof BossEnemy) {
        this.currentBoss = enemy;
        this.isBossActive = true;
      }
      this.enemies.push(enemy);
    });

    gameState.setWave(this.waveManager.getCurrentWave());

    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player.getPosition());
      
      if (enemy instanceof RangedEnemy) {
        const newProjectiles = enemy.getProjectiles();
        this.enemyProjectiles.push(...newProjectiles);
      }
    });

    if (this.currentBoss && this.currentBoss.isAlive()) {
      gameState.updateBossHealth(this.currentBoss.getHealth(), this.currentBoss.getMaxHealth());
      
      const minionSpawns = this.currentBoss.getMinionSpawnQueue();
      minionSpawns.forEach(spawn => {
        const minion = new Enemy(spawn.x, spawn.y, "basic");
        this.enemies.push(minion);
      });

      if (this.currentBoss.isGroundPounding()) {
        const groundPoundRadius = this.currentBoss.getGroundPoundRadius();
        const groundPoundDamage = this.currentBoss.getGroundPoundDamage();
        
        const dx = this.player.x - this.currentBoss.x;
        const dy = this.player.y - this.currentBoss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= groundPoundRadius) {
          const damage = groundPoundDamage * deltaTime;
          this.totalDamageTaken += damage;
          gameState.takeDamage(damage);
          this.screenShake.trigger(15, 0.4);
        }
      }
    }

    const newProjectiles = this.player.fireWeapon(deltaTime);
    this.projectiles.push(...newProjectiles);

    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        weapon.setTileRenderer(this.infiniteTileRenderer);
        weapon.update(deltaTime, this.enemies, this.player.x, this.player.y);
      }
    }

    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);
      return projectile.isAlive();
    });

    this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
      projectile.update(deltaTime);
      return projectile.isAlive();
    });

    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.isAlive();
    });

    this.damageNumbers.update(deltaTime);
    
    this.comboSystem.update(deltaTime);
    const comboCount = this.comboSystem.getComboCount();
    const comboMultiplier = this.comboSystem.getComboMultiplier();
    const comboTimeRemaining = this.comboSystem.getTimeRemaining();
    
    gameState.updateCombo(comboCount, comboMultiplier);
    gameState.setCombo(comboCount, comboMultiplier, comboTimeRemaining);
    
    this.screenShake.update(deltaTime);

    this.passiveItems.applyEffects(this.player);

    this.experienceOrbs = this.experienceOrbs.filter(orb => {
      orb.update(deltaTime, this.player.getPosition());
      return !orb.isExpired();
    });

    this.bossLoot = this.bossLoot.filter(loot => {
      loot.update(deltaTime, this.player.getPosition());
      
      if (loot.canBeCollected(this.player.getPosition())) {
        loot.collect();
        const lootValue = 100;
        gameState.addCurrency(lootValue);
        
        if (!audioState.isMuted) {
          audioState.playSuccess();
        }
        
        console.log(`Collected boss loot: ${loot.getName()} (+${lootValue} gold, total: ${gameState.currency + lootValue})`);
        return false;
      }
      
      return !loot.isCollected();
    });

    this.handleCollisions();

    if (this.bossDefeatedCelebrationTimer > 0) {
      this.bossDefeatedCelebrationTimer -= deltaTime;
      
      if (Math.random() < 0.3) {
        this.createCelebrationParticles();
      }
    }

    this.handleSplittingEnemies();

    this.enemies = this.enemies.filter(enemy => enemy.isAlive());

    if (this.currentBoss && !this.currentBoss.isAlive() && this.isBossActive) {
      this.handleBossDefeated();
    }
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
      this.enemies.push(splitEnemy as unknown as Enemy);
      
      for (let i = 0; i < 3; i++) {
        this.particles.push(new Particle(
          splitEnemy.x + (Math.random() - 0.5) * 20,
          splitEnemy.y + (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80,
          "#44ff44",
          0.5
        ));
      }
    });
  }

  private handleBossDefeated() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    
    const bossScore = this.currentBoss?.getScoreValue() || 500;
    const bonusXP = bossScore * 2;
    
    gameState.addScore(bossScore);
    gameState.addExperience(bonusXP);
    
    this.experienceOrbs.push(new ExperienceOrb(this.currentBoss!.x, this.currentBoss!.y, bonusXP));
    
    // Generate boss loot
    const loot = generateBossLoot(this.currentBoss!.x, this.currentBoss!.y, this.currentBoss!.getBossType());
    this.bossLoot.push(...loot);
    
    for (let i = 0; i < 30; i++) {
      this.particles.push(new Particle(
        this.currentBoss!.x + (Math.random() - 0.5) * 100,
        this.currentBoss!.y + (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        Math.random() > 0.5 ? "#ffd700" : "#ff6600",
        2.0
      ));
    }
    
    this.screenShake.trigger(20, 0.8);
    this.bossDefeatedCelebrationTimer = 3;
    
    if (!audioState.isMuted) {
      audioState.playSuccess();
    }
    
    this.waveManager.onBossDefeated();
    gameState.setBossActive(false);
    gameState.addBossKill();
    
    this.currentBoss = null;
    this.isBossActive = false;
    
    console.log("Boss defeated! Bonus XP and score awarded!");
  }

  private handlePlayerDeath() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    
    // Create death particles
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle(
        this.player.x + (Math.random() - 0.5) * 60,
        this.player.y + (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        Math.random() > 0.5 ? "#ff0000" : "#880000",
        1.5
      ));
    }
    
    // Record statistics
    const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const characterId = gameState.selectedCharacter?.id || "guardian";
    
    // Add currency based on performance (score and wave) - BEFORE ending game
    const currencyEarned = Math.floor(gameState.score / 100) + (gameState.wave * 10);
    
    console.log(`Recording run stats - Kills: ${gameState.totalKills}, Damage Dealt: ${this.totalDamageDealt}, Damage Taken: ${this.totalDamageTaken}, Currency Earned: ${currencyEarned}`);
    
    // Save to StatisticsSystem
    StatisticsSystem.recordRun({
      characterId,
      kills: gameState.totalKills,
      wave: gameState.wave,
      level: gameState.level,
      score: gameState.score,
      playTime,
      damageTaken: this.totalDamageTaken,
      damageDealt: this.totalDamageDealt,
      experienceGained: gameState.experience,
      maxCombo: gameState.maxCombo,
      bossesDefeated: gameState.bossesDefeated
    });
    
    // Save to PersistentProgressionSystem
    PersistentProgressionSystem.recordRunEnd(
      gameState.score,
      gameState.wave,
      gameState.totalKills,
      gameState.maxCombo,
      gameState.bossesDefeated,
      playTime
    );
    
    // Add currency to persistent system
    PersistentProgressionSystem.addCurrency(currencyEarned);
    
    // Sync currency with game state BEFORE game over
    const savedProgression = PersistentProgressionSystem.load();
    useGameState.setState({ currency: savedProgression.currency });
    
    // Verify saves
    const savedStats = StatisticsSystem.load();
    console.log('Statistics saved:', savedStats);
    console.log('Progression saved - Currency:', savedProgression.currency, 'Total Kills:', savedProgression.totalKills);
    
    // Play death sound
    if (!audioState.isMuted) {
      audioState.playPlayerHurt();
    }
    
    // Trigger game over
    gameState.end();
  }

  private createCelebrationParticles() {
    const colors = ["#ffd700", "#ff6600", "#00ff00", "#00ffff", "#ff00ff"];
    const x = this.player.x + (Math.random() - 0.5) * 400;
    const y = this.player.y + (Math.random() - 0.5) * 400;
    
    this.particles.push(new Particle(
      x, y,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100 - 50,
      colors[Math.floor(Math.random() * colors.length)],
      1.5
    ));
  }

  private handleCollisions() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();

    this.projectiles.forEach(projectile => {
      if (!projectile.isAlive()) return;

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(projectile, enemy)) {
          if (!this.collisionDetection.canDamageEnemy(enemy)) {
            this.createHitParticles(enemy.x, enemy.y, "#0088ff");
            return;
          }
          
          const damage = projectile.getDamage();
          enemy.takeDamage(damage);
          this.totalDamageDealt += damage;
          projectile.addHit();
          this.createHitParticles(enemy.x, enemy.y);
          this.damageNumbers.addDamageNumber(enemy.x, enemy.y - 20, damage, false);

          if (!audioState.isMuted) {
            audioState.playHit();
          }

          if (!enemy.isAlive()) {
            if (!(enemy instanceof BossEnemy)) {
              this.comboSystem.addKill();
              gameState.addKill();
              const scoreWithCombo = Math.floor(enemy.getScoreValue() * this.comboSystem.getComboMultiplier());
              gameState.addScore(scoreWithCombo);
              this.createDeathParticles(enemy.x, enemy.y);
              const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
              this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
              
              // Add gold for each kill
              const goldValue = Math.max(1, Math.floor(enemy.getScoreValue() / 10));
              gameState.addCurrency(goldValue);
            }
          }
        }
      });
    });

    this.enemyProjectiles.forEach(projectile => {
      if (!projectile.isAlive()) return;

      if (this.collisionDetection.checkEnemyProjectilePlayerCollision(projectile, this.player)) {
        const damage = projectile.getDamage();
        this.totalDamageTaken += damage;
        gameState.takeDamage(damage);
        projectile.markForRemoval();
        this.createHitParticles(this.player.x, this.player.y, "#cc00cc");

        if (!audioState.isMuted) {
          audioState.playHit();
        }
      }
    });

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;

      if (this.collisionDetection.checkCollision(this.player, enemy)) {
        const damage = enemy.getDamage();
        this.totalDamageTaken += damage;
        gameState.takeDamage(damage);
        
        this.screenShake.trigger(5, 0.2);

        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          enemy.x += (dx / distance) * 30;
          enemy.y += (dy / distance) * 30;
        }

        this.createHitParticles(this.player.x, this.player.y, "#ff4444");
      }
    });

    const orbitalWeapons = this.player.getOrbitalWeapons();
    orbitalWeapons.forEach(orbital => {
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(orbital, enemy)) {
          if (!this.collisionDetection.canDamageEnemy(enemy)) {
            this.createHitParticles(orbital.x, orbital.y, "#0088ff");
            return;
          }
          
          const damage = orbital.dealDamage();
          if (damage > 0) {
            enemy.takeDamage(damage);
            this.createHitParticles(orbital.x, orbital.y, "#4444ff");

            if (!audioState.isMuted) {
              audioState.playHit();
            }

            if (!enemy.isAlive() && !(enemy instanceof BossEnemy)) {
              this.comboSystem.addKill();
              gameState.addKill();
              const scoreWithCombo = Math.floor(enemy.getScoreValue() * this.comboSystem.getComboMultiplier());
              gameState.addScore(scoreWithCombo);
              this.createDeathParticles(enemy.x, enemy.y);
              const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
              this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
              
              // Add gold for each kill
              const goldValue = Math.max(1, Math.floor(enemy.getScoreValue() / 10));
              gameState.addCurrency(goldValue);
            }
          }
        }
      });
    });

    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        const orbCollisions = weapon.checkCollisions(this.enemies);

        orbCollisions.forEach(collision => {
          this.createHitParticles(collision.orbX, collision.orbY);

          if (!audioState.isMuted) {
            audioState.playHit();
          }

          if (!collision.enemy.isAlive() && !(collision.enemy instanceof BossEnemy)) {
            this.comboSystem.addKill();
            gameState.addKill();
            const scoreWithCombo = Math.floor(collision.enemy.getScoreValue() * this.comboSystem.getComboMultiplier());
            gameState.addScore(scoreWithCombo);
            this.createDeathParticles(collision.enemy.x, collision.enemy.y);
            const expValue = Math.max(1, Math.floor(collision.enemy.getScoreValue() / 2));
            this.experienceOrbs.push(new ExperienceOrb(collision.enemy.x, collision.enemy.y, expValue));
            
            // Add gold for each kill
            const goldValue = Math.max(1, Math.floor(collision.enemy.getScoreValue() / 10));
            gameState.addCurrency(goldValue);
          }
        });
      }
    }

    this.experienceOrbs = this.experienceOrbs.filter(orb => {
      if (orb.canBeCollected(this.player.getPosition())) {
        gameState.addExperience(orb.getValue());

        if (!audioState.isMuted) {
          audioState.playSuccess();
        }

        return false;
      }
      return true;
    });
  }

  private createHitParticles(x: number, y: number, color = "#ffff44") {
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

  private createDeathParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        Math.random() > 0.5 ? "#ff4444" : "#ff8844",
        1.0
      ));
    }
  }

  private handleSpiderKills() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();

    const deadEnemies = this.enemies.filter(enemy => !enemy.isAlive());

    deadEnemies.forEach(enemy => {
      const spiders = (this.player as AssassinPlayer).getSpiders();
      const isSpiderKill = spiders.some(spider => {
        return spider.isAttached && Math.abs(spider.x - enemy.x) < 5 && Math.abs(spider.y - enemy.y) < 5;
      });

      if (isSpiderKill && !(enemy instanceof BossEnemy)) {
        this.comboSystem.addKill();
        gameState.addKill();
        const scoreWithCombo = Math.floor(enemy.getScoreValue() * this.comboSystem.getComboMultiplier());
        gameState.addScore(scoreWithCombo);
        this.createDeathParticles(enemy.x, enemy.y);

        if (!audioState.isMuted) {
          audioState.playHit();
        }

        const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
        this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
        
        // Add gold for each kill
        const goldValue = Math.max(1, Math.floor(enemy.getScoreValue() / 10));
        gameState.addCurrency(goldValue);
      }
    });
  }

  private render(deltaTime: number) {
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.infiniteTileRenderer.render(this.ctx, {
      x: this.camera.x,
      y: this.camera.y,
      width: this.camera.width,
      height: this.camera.height
    });

    const gameState = useGameState.getState();

    if (gameState.phase !== "playing") return;

    this.ctx.save();
    const shakeOffset = this.screenShake.getOffset();
    this.ctx.translate(-this.camera.x + shakeOffset.x, -this.camera.y + shakeOffset.y);

    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });

    this.experienceOrbs.forEach(orb => {
      orb.render(this.ctx);
    });

    this.bossLoot.forEach(loot => {
      loot.render(this.ctx);
    });

    this.projectiles.forEach(projectile => {
      projectile.render(this.ctx, 0, 0);
    });

    this.enemyProjectiles.forEach(projectile => {
      projectile.render(this.ctx);
    });

    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        weapon.render(this.ctx, this.camera.x, this.camera.y);
      }
    }

    this.player.render(this.ctx, deltaTime);

    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.render(this.ctx, deltaTime);
      }
    });

    this.damageNumbers.render(this.ctx);

    this.ctx.restore();

    if (process.env.NODE_ENV === "development") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px monospace";
      this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, this.canvas.height - 100);
      this.ctx.fillText(`Projectiles: ${this.projectiles.length}`, 10, this.canvas.height - 80);
      this.ctx.fillText(`Enemy Projectiles: ${this.enemyProjectiles.length}`, 10, this.canvas.height - 60);
      this.ctx.fillText(`Particles: ${this.particles.length}`, 10, this.canvas.height - 40);
      this.ctx.fillText(`Boss Active: ${this.isBossActive}`, 10, this.canvas.height - 20);
    }
  }

  private async initializeSprites() {
    await this.spriteManager.loadAllSprites();
  }

  private setupPlayer() {
    const gameState = useGameState.getState();
    const character = gameState.selectedCharacter;

    if (character?.id === "assassin") {
      this.player = new AssassinPlayer(this.canvas.width / 2, this.canvas.height / 2);
    } else {
      this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    }
  }
}
