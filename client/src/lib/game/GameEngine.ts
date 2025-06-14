import { Player } from './entities/Player';
import { AssassinPlayer } from './entities/AssassinPlayer';
import { Enemy } from './entities/Enemy';
import { Projectile } from './weapons/Projectile';
import { ExperienceOrb } from './entities/ExperienceOrb';
import { SylphBloomsWeapon } from './weapons/SylphBloomsWeapon';
import { AssassinSpiderWeapon } from './weapons/AssassinSpiderWeapon';
import { OrbitalWeapon } from './weapons/OrbitalWeapon';
import { PowerUpDefinition } from './entities/PowerUp';
import { CollisionDetection } from './systems/CollisionDetection';
import { WaveManager } from './managers/WaveManager';
import { SpriteManager } from './rendering/SpriteManager';
import { AnimationManager } from './rendering/AnimationManager';
import { CameraSystem } from './rendering/CameraSystem';
import { InfiniteTileRenderer } from './rendering/InfiniteTileRenderer';
import { EndlessCaveRenderer } from './rendering/EndlessCaveRenderer';
import { Particle } from './rendering/Particle';
import { InputManager } from './systems/InputManager';
import { useGameState } from "../stores/useGameState";
import { useAudio } from "../stores/useAudio";
import { SingleShotWeapon, SpreadShotWeapon, RapidFireWeapon, MultiDirectionalWeapon, PiercingWeapon } from "./weapons/WeaponTypes";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private experienceOrbs: ExperienceOrb[] = [];
  private waveManager: WaveManager;
  private collisionDetection: CollisionDetection;
  private inputManager: InputManager;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private lastMuteState = false;
  private lastRestartState = false;
  private lastWeapon1State = false;
  private lastWeapon2State = false;
  private lastWeapon3State = false;
  private lastWeapon4State = false;
  private lastWeapon5State = false;
  private spriteManager: SpriteManager;
  private infiniteTileRenderer: InfiniteTileRenderer;
  private camera: CameraSystem;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    // Initialize game systems
    this.player = new Player(canvas.width / 2, canvas.height / 2);
    this.waveManager = new WaveManager();
    this.collisionDetection = new CollisionDetection();
    this.inputManager = new InputManager();
    this.spriteManager = SpriteManager.getInstance();
    this.infiniteTileRenderer = new InfiniteTileRenderer();
    this.camera = new CameraSystem(canvas.width, canvas.height);

    // Set up input handling
    this.setupInput();

    // Initialize sprites
    this.initializeSprites();
  }

  private setupInput() {
    // Handle game start
    const handleStart = () => {
      const gameState = useGameState.getState();
      if (gameState.phase === "ready") {
        gameState.start();
        // Start background music
        const audioState = useAudio.getState();
        if (audioState.backgroundMusic && !audioState.isMuted) {
          audioState.backgroundMusic.play().catch(console.warn);
        }
      }
    };

    // Handle restart
    const handleRestart = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        const gameState = useGameState.getState();
        gameState.restart();
        this.resetGame();
      }
    };

    // Handle sound toggle
    const handleSoundToggle = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        const audioState = useAudio.getState();
        audioState.toggleMute();

        // Handle background music
        if (audioState.backgroundMusic) {
          if (audioState.isMuted) {
            audioState.backgroundMusic.pause();
          } else {
            audioState.backgroundMusic.play().catch(console.warn);
          }
        }
      }
    };

    // Handle debug weapon switching
    // Weapon switching removed - only Sylph Blooms weapon available

    // Add event listeners
    document.addEventListener("keydown", handleStart);
    document.addEventListener("click", handleStart);
    document.addEventListener("keydown", handleRestart);
    document.addEventListener("keydown", handleSoundToggle);
    //document.addEventListener("keydown", handleWeaponSwitch);

    // Store references for cleanup
    this.inputManager.addEventListeners();
  }

  private resetGame() {
    this.setupPlayer();
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.experienceOrbs = [];
    this.waveManager.reset();
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
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.02); // Cap at 50fps minimum
    this.lastTime = currentTime;

    const gameState = useGameState.getState();

    // Check if we need to setup player for selected character
    if (gameState.selectedCharacter && gameState.phase === "playing") {
      // Only setup if we don't have the right player type
      const isAssassin = gameState.selectedCharacter.id === "assassin";
      const hasAssassinPlayer = this.player instanceof AssassinPlayer;

      if (isAssassin && !hasAssassinPlayer) {
        this.setupPlayer();
      } else if (!isAssassin && hasAssassinPlayer) {
        this.setupPlayer();
      }
    }

    // Only update game logic when playing, but always render
    if (gameState.phase === "playing") {
      this.update(deltaTime);
    }

    this.render(deltaTime);
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public getPlayer() {
    return this.player;
  }

  private update(deltaTime: number) {
    const gameState = useGameState.getState();

    // Update player with tile collision
    this.player.update(deltaTime, this.inputManager.getInput(), this.canvas.width, this.canvas.height, this.infiniteTileRenderer);

    // If assassin player, update spiders
    if (this.player instanceof AssassinPlayer) {
      this.player.setTileRenderer(this.infiniteTileRenderer);
      this.player.updateSpiders(deltaTime, this.enemies, this.player.getPosition());
    }

    // Update camera to follow player
    this.camera.update(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, deltaTime);

    // Update camera size if canvas resized
    if (this.camera.width !== this.canvas.width || this.camera.height !== this.canvas.height) {
      this.camera.setSize(this.canvas.width, this.canvas.height);
    }

    // Update wave manager and spawn enemies
    this.waveManager.update(deltaTime);
    const newEnemies = this.waveManager.spawnEnemies(this.canvas.width, this.canvas.height);
    this.enemies.push(...newEnemies);

    // Update wave number in state
    gameState.setWave(this.waveManager.getCurrentWave());

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player.getPosition());
    });

    // Update player weapon and get projectiles
    const newProjectiles = this.player.fireWeapon(deltaTime);
    this.projectiles.push(...newProjectiles);

    // Update spider weapon if player is AssassinPlayer (already handled above)
    // Removed duplicate call

    // Update weapon (for SylphBloomsWeapon) - only for non-assassin players
    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        weapon.setTileRenderer(this.infiniteTileRenderer);
        weapon.update(deltaTime, this.enemies, this.player.x, this.player.y);
      }
    }

    // Update projectiles
    const beforeCount = this.projectiles.length;
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);

      const isAlive = projectile.isAlive();

      // Debug: Log when projectiles are removed
      if (!isAlive && beforeCount > 0) {
        console.log(`Projectile removed at position (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)})`);
      }

      // Only filter by lifetime - projectiles will naturally expire after 3 seconds
      // This prevents premature removal when player moves far distances
      return isAlive;
    });

    // Debug: Log projectile count changes
    if (this.projectiles.length !== beforeCount) {
      console.log(`Projectile count changed: ${beforeCount} -> ${this.projectiles.length}`);
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.isAlive();
    });

    // Update experience orbs
    this.experienceOrbs = this.experienceOrbs.filter(orb => {
      orb.update(deltaTime, this.player.getPosition());
      return !orb.isExpired();
    });

    // Collision detection
    this.handleCollisions();

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
  }

  private handleCollisions() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();

    // Projectile vs Enemy collisions
    this.projectiles.forEach(projectile => {
      if (!projectile.isAlive()) return;

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(projectile, enemy)) {
          // Damage enemy
          enemy.takeDamage(projectile.getDamage());

          // Handle piercing logic - addHit returns true if projectile should be destroyed
          projectile.addHit();

          // Create hit particles
          this.createHitParticles(enemy.x, enemy.y);

          // Play hit sound
          if (!audioState.isMuted) {
            audioState.playHit();
          }

          // If enemy died, add score and drop experience
          if (!enemy.isAlive()) {
            gameState.addScore(enemy.getScoreValue());
            this.createDeathParticles(enemy.x, enemy.y);

            // Drop experience orb
            const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
            this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
          }
        }
      });
    });

    // Player vs Enemy collisions
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;

      if (this.collisionDetection.checkCollision(this.player, enemy)) {
        // Player takes damage
        gameState.takeDamage(enemy.getDamage());

        // Push enemy away to prevent multiple hits
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          enemy.x += (dx / distance) * 30;
          enemy.y += (dy / distance) * 30;
        }

        // Create damage particles
        this.createHitParticles(this.player.x, this.player.y, "#ff4444");
      }
    });

    // Orbital Weapon vs Enemy collisions
    const orbitalWeapons = this.player.getOrbitalWeapons();
    orbitalWeapons.forEach(orbital => {
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(orbital, enemy)) {
          const damage = orbital.dealDamage();
          if (damage > 0) {
            enemy.takeDamage(damage);

            // Create hit particles
            this.createHitParticles(orbital.x, orbital.y, "#4444ff");

            // Play hit sound
            if (!audioState.isMuted) {
              audioState.playHit();
            }

            // If enemy died, add score and drop experience
            if (!enemy.isAlive()) {
              gameState.addScore(enemy.getScoreValue());
              this.createDeathParticles(enemy.x, enemy.y);

              const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
              this.experienceOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
            }
          }
        }
      });
    });

    // Weapon vs Enemy collisions (for SylphBloomsWeapon) - only for non-assassin players
    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        const orbCollisions = weapon.checkCollisions(this.enemies);

        // Handle each orb collision
        orbCollisions.forEach(collision => {
          // Create hit particles
          this.createHitParticles(collision.orbX, collision.orbY);

          // Play hit sound
          if (!audioState.isMuted) {
            audioState.playHit();
          }

          // If enemy died, add score and drop experience
          if (!collision.enemy.isAlive()) {
            gameState.addScore(collision.enemy.getScoreValue());
            this.createDeathParticles(collision.enemy.x, collision.enemy.y);

            // Drop experience orb
            const expValue = Math.max(1, Math.floor(collision.enemy.getScoreValue() / 2));
            this.experienceOrbs.push(new ExperienceOrb(collision.enemy.x, collision.enemy.y, expValue));
          }
        });
      }
    }

    // Player vs Experience Orb collisions
    this.experienceOrbs = this.experienceOrbs.filter(orb => {
      if (orb.canBeCollected(this.player.getPosition())) {
        gameState.addExperience(orb.getValue());

        // Play success sound
        if (!audioState.isMuted) {
          audioState.playSuccess();
        }

        return false; // Remove the orb
      }
      return true; // Keep the orb
    });
  }

  private createHitParticles(x: number, y: number, color = "#ffff44") {
    for (let i = 0; i < 5; i++) {
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
    for (let i = 0; i < 12; i++) {
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

  private render(deltaTime: number) {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw infinite tilemap background
    this.infiniteTileRenderer.render(this.ctx, {
      x: this.camera.x,
      y: this.camera.y,
      width: this.camera.width,
      height: this.camera.height
    });

    const gameState = useGameState.getState();

    if (gameState.phase !== "playing") return;

    // Save context for camera transformations
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Render particles (background layer)
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });

    // Render experience orbs
    this.experienceOrbs.forEach(orb => {
      orb.render(this.ctx);
    });

    // Render projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(this.ctx);
    });

    // Render weapon effects if player has Sylph Blooms weapon - only for non-assassin players
    if (!(this.player instanceof AssassinPlayer)) {
      const weapon = this.player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        weapon.render(this.ctx, this.camera.x, this.camera.y);
      }
    }

    // Render player
    this.player.render(this.ctx, deltaTime);

    // Render spiders if player is AssassinPlayer
    if (this.player instanceof AssassinPlayer) {
      this.player.renderSpiders(this.ctx, deltaTime, this.camera.x, this.camera.y);
    }

    // Render enemies
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.render(this.ctx, this.camera.x, this.camera.y);
      }
    });

    // Restore context
    this.ctx.restore();

    // Debug info
    if (process.env.NODE_ENV === "development") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px monospace";
      this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, this.canvas.height - 100);
      this.ctx.fillText(`Projectiles: ${this.projectiles.length}`, 10, this.canvas.height - 80);
      this.ctx.fillText(`Particles: ${this.particles.length}`, 10, this.canvas.height - 60);
      this.ctx.fillText(`Experience Orbs: ${this.experienceOrbs.length}`, 10, this.canvas.height - 40);
      this.ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - this.lastTime))}`, 10, this.canvas.height - 20);
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
      // Default to Sylph player (or regular player if no character selected)
      this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    }
  }
}