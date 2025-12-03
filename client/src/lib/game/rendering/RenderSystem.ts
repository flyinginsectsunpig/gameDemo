
import { CameraSystem } from './CameraSystem';
import { InfiniteTileRenderer } from './InfiniteTileRenderer';
import { EntityManager } from '../managers/EntityManager';
import { SylphBloomsWeapon } from '../weapons/SylphBloomsWeapon';
import { AssassinPlayer } from '../entities/characters/AssassinPlayer';
import { useGameState } from '../../stores/useGameState';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private camera: CameraSystem;
  private tileRenderer: InfiniteTileRenderer;
  private entityManager: EntityManager;

  constructor(
    ctx: CanvasRenderingContext2D,
    camera: CameraSystem,
    tileRenderer: InfiniteTileRenderer,
    entityManager: EntityManager
  ) {
    this.ctx = ctx;
    this.camera = camera;
    this.tileRenderer = tileRenderer;
    this.entityManager = entityManager;
  }

  public render(deltaTime: number) {
    const gameState = useGameState.getState();
    
    // Clear canvas
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Render tile background
    this.tileRenderer.render(this.ctx, {
      x: this.camera.x,
      y: this.camera.y,
      width: this.camera.width,
      height: this.camera.height
    });

    if (gameState.phase !== "playing") return;

    this.ctx.save();
    const shakeOffset = this.entityManager.getGameStateManager?.()?.getScreenShake().getOffset() || { x: 0, y: 0 };
    this.ctx.translate(-this.camera.x + shakeOffset.x, -this.camera.y + shakeOffset.y);

    // Render particles
    this.entityManager.getParticles().forEach(particle => {
      particle.render(this.ctx);
    });

    // Render collectibles
    this.entityManager.getExperienceOrbs().forEach(orb => {
      orb.render(this.ctx);
    });

    this.entityManager.getBossLoot().forEach(loot => {
      loot.render(this.ctx);
    });

    // Render projectiles
    this.entityManager.getProjectiles().forEach(projectile => {
      projectile.render(this.ctx, 0, 0);
    });

    this.entityManager.getEnemyProjectiles().forEach(projectile => {
      projectile.render(this.ctx);
    });

    // Render weapons
    const player = this.entityManager.getPlayer();
    if (!(player instanceof AssassinPlayer)) {
      const weapon = player.getWeapon();
      if (weapon instanceof SylphBloomsWeapon) {
        weapon.render(this.ctx, this.camera.x, this.camera.y);
      }
    }

    // Render player
    player.render(this.ctx, deltaTime);

    // Render enemies
    this.entityManager.getEnemies().forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.render(this.ctx, deltaTime);
      }
    });

    // Render damage numbers
    this.entityManager.getDamageNumbers().render(this.ctx);

    this.ctx.restore();

    // Debug info
    if (process.env.NODE_ENV === "development") {
      this.renderDebugInfo();
    }
  }

  private renderDebugInfo() {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "12px monospace";
    const y = this.ctx.canvas.height;
    this.ctx.fillText(`Enemies: ${this.entityManager.getEnemies().length}`, 10, y - 100);
    this.ctx.fillText(`Projectiles: ${this.entityManager.getProjectiles().length}`, 10, y - 80);
    this.ctx.fillText(`Enemy Projectiles: ${this.entityManager.getEnemyProjectiles().length}`, 10, y - 60);
    this.ctx.fillText(`Particles: ${this.entityManager.getParticles().length}`, 10, y - 40);
    this.ctx.fillText(`Boss Active: ${this.entityManager.getCurrentBoss() !== null}`, 10, y - 20);
  }
}
