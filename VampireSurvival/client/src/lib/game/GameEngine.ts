import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Projectile } from "./Projectile";
import { Particle } from "./Particle";
import { ExperienceOrb } from "./ExperienceOrb";
import { WaveManager } from "./WaveManager";
import { CollisionDetection } from "./CollisionDetection";
import { InputManager } from "./InputManager";
import { useGameState } from "../stores/useGameState";
import { useAudio } from "../stores/useAudio";

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

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Initialize game systems
    this.player = new Player(canvas.width / 2, canvas.height / 2);
    this.waveManager = new WaveManager();
    this.collisionDetection = new CollisionDetection();
    this.inputManager = new InputManager();
    
    // Set up input handling
    this.setupInput();
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

    // Add event listeners
    document.addEventListener("keydown", handleStart);
    document.addEventListener("click", handleStart);
    document.addEventListener("keydown", handleRestart);
    document.addEventListener("keydown", handleSoundToggle);
    
    // Store references for cleanup
    this.inputManager.addEventListeners();
  }

  private resetGame() {
    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
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
    
    // Only update game logic when playing, but always render
    if (gameState.phase === "playing") {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public getPlayer() {
    return this.player;
  }

  private update(deltaTime: number) {
    const gameState = useGameState.getState();
    
    // Update player
    const input = this.inputManager.getInput();
    this.player.update(deltaTime, input, this.canvas.width, this.canvas.height);

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

    // Player weapon firing
    const newProjectiles = this.player.fireWeapon(deltaTime);
    this.projectiles.push(...newProjectiles);

    // Update projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);
      return projectile.isAlive() && 
             projectile.x > -50 && projectile.x < this.canvas.width + 50 &&
             projectile.y > -50 && projectile.y < this.canvas.height + 50;
    });

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
          projectile.destroy();

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

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const gameState = useGameState.getState();
    
    if (gameState.phase !== "playing") return;

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

    // Render enemies
    this.enemies.forEach(enemy => {
      enemy.render(this.ctx);
    });

    // Render player
    this.player.render(this.ctx);

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
}
