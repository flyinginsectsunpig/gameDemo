import { GameObject } from "./Player";
import { Enemy } from "./Enemy";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

export class MechanicalSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 120; // Increased from 32 to match FollowerSpider
  public height = 68; // Increased from 32 to match FollowerSpider
  private vx = 0;
  private vy = 0;
  private speed = 150;
  private alive = true;
  private target: Enemy | null = null;
  private isAttached = false;
  private damage = 2;
  private damageTimer = 0;
  private damageCooldown = 0.5; // damage every 0.5 seconds
  private searchRadius = 120;
  private lastDirection = { x: 0, y: 1 }; // Track movement direction for sprite selection
  private animationManager: AnimationManager;
  private instanceId: string;
  private currentAnimation = "spider_idle";
  private lastAnimationFrame: any = null;
  private lastAnimationSwitch = 0;
  private tileRenderer: any; // Tile renderer instance

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.instanceId = `mechanical_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();
  }

  private setupAnimations() {
    // Generate all 30 walking frames (each frame is 800px wide)
    const walkFrames = [];
    for (let i = 0; i < 30; i++) {
      walkFrames.push({
        x: i * 800,
        y: 0,
        width: 800,
        height: 450
      });
    }

    // Use the first frame as idle animation
    const idleFrames = [
      { x: 0, y: 0, width: 800, height: 450 }
    ];

    this.animationManager.addAnimation("spider_idle", idleFrames, 0.5, true);
    this.animationManager.addAnimation("spider_walk_down", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_up", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_side", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_diagonal", walkFrames, 0.05, true);

    this.lastAnimationFrame = idleFrames[0];
  }

  public update(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    let targetAnimation = "spider_idle";

    if (this.isAttached && this.target) {
      // Spider is attached to enemy - deal damage over time
      this.damageTimer += deltaTime;

      if (!this.target.isAlive()) {
        // When target dies, detach and find new target
        this.isAttached = false;
        this.target = null;
        return;
      }

      // Follow the target enemy
      this.x = this.target.x;
      this.y = this.target.y;

      // Deal damage periodically
      if (this.damageTimer >= this.damageCooldown) {
        this.target.takeDamage(this.damage);
        this.damageTimer = 0;
      }

      // Use idle animation when attached
      targetAnimation = "spider_idle";
    } else {
      // Spider is searching for a target
      if (!this.target || !this.target.isAlive()) {
        this.findNearestEnemy(enemies);
      }

      if (this.target) {
        // Move towards target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          // Attach to enemy
          this.isAttached = true;
        } else {
          // Move towards target
          this.vx = (dx / distance) * this.speed;
          this.vy = (dy / distance) * this.speed;

          // Update direction for sprite selection
          this.lastDirection.x = dx / distance;
          this.lastDirection.y = dy / distance;

          // Update position
          this.x += this.vx * deltaTime;
          this.y += this.vy * deltaTime;

          // Choose animation based on movement direction
          const absX = Math.abs(this.lastDirection.x);
          const absY = Math.abs(this.lastDirection.y);

          if (absY > 0.6) {
            targetAnimation = this.lastDirection.y > 0 ? "spider_walk_up" : "spider_walk_down";
          } else if (absX > 0.6) {
            targetAnimation = "spider_walk_side";
          } else {
            targetAnimation = "spider_walk_diagonal";
          }
        }
      } else {
        // No target found - stay idle at current position
        this.vx = 0;
        this.vy = 0;
        targetAnimation = "spider_idle";
      }
    }

    // Update animation
    this.animationManager.update(deltaTime, this.instanceId, targetAnimation);
    if (this.currentAnimation !== targetAnimation) {
      this.currentAnimation = targetAnimation;
    }

    // Update tile renderer with new position and animation
    if (this.tileRenderer) {
      this.tileRenderer.updateSpider(this.instanceId, this.x, this.y, this.currentAnimation, this.lastDirection);
    }
  }

  private findNearestEnemy(enemies: Enemy[]) {
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = this.searchRadius;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }

    this.target = nearestEnemy;
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy(): void {
    this.alive = false;
    // Remove from tile renderer when destroyed
    if (this.tileRenderer) {
      this.tileRenderer.removeSpider(this.instanceId);
    }
  }

  public setTileRenderer(tileRenderer: any): void {
    this.tileRenderer = tileRenderer;
    // Register spider with tile renderer for background rendering
    if (this.tileRenderer) {
      this.tileRenderer.addSpider({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        currentAnimation: this.currentAnimation,
        instanceId: this.instanceId,
        lastDirection: this.lastDirection
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();

    // Determine which sprite to use based on movement direction
    let spriteName = "spider_down"; // default

    if (this.isAttached && this.target) {
      // Use jumping sprite when attached
      spriteName = "spider_jumping";
    } else {
      // Choose sprite based on movement direction
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);

      if (this.currentAnimation === "spider_idle") {
        spriteName = "spider_down"; // Default idle sprite
      } else {
        // Use movement direction to determine sprite
        if (absY > 0.6) {
          spriteName = this.lastDirection.y > 0 ? "spider_up" : "spider_down";
        } else if (absX > 0.6) {
          spriteName = "spider_side";
        } else {
          // Diagonal movement
          spriteName = this.lastDirection.y > 0 ? "spider_diagonal_up" : "spider_diagonal_down";
        }
      }
    }

    const sprite = spriteManager.getSprite(spriteName);

    if (sprite) {
      ctx.save();

      // Update animation frame
      const validDeltaTime = 0.016; // Fixed deltaTime for consistency
      const currentFrame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);

      if (currentFrame) {
        this.lastAnimationFrame = currentFrame;
      }

      // Apply visual effects based on spider state
      if (this.isAttached) {
        // Pulsing red tint when attached and dealing damage
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.filter = 'hue-rotate(0deg) saturate(2) brightness(1.2)';
        ctx.shadowColor = "#ff3333";
        ctx.shadowBlur = 8;
      } else {
        // Normal appearance with blue tint to distinguish from FollowerSpider
        ctx.shadowColor = "#3333ff";
        ctx.shadowBlur = 4;
        ctx.globalAlpha = 0.9;
      }

      // Calculate render position
      const renderX = this.x - cameraX - this.width/2;
      const renderY = this.y - cameraY - this.height/2;

      // Use animation frame if available
      const frameToUse = currentFrame || this.lastAnimationFrame;

      // Handle sprite flipping based on horizontal movement
      // Only flip for side movement, and flip when moving left (negative x)
      const shouldFlip = spriteName === "spider_side" && this.lastDirection.x < 0;

      if (shouldFlip) {
        ctx.scale(-1, 1);
      }

      if (frameToUse) {
        ctx.drawImage(
          sprite,
          frameToUse.x, frameToUse.y, frameToUse.width, frameToUse.height,
          shouldFlip ? -renderX - this.width : renderX,
          renderY,
          this.width,
          this.height
        );
      } else {
        // Fallback to full sprite
        ctx.drawImage(
          sprite,
          shouldFlip ? -renderX - this.width : renderX,
          renderY,
          this.width,
          this.height
        );
      }

      ctx.restore();
    } else {
      // Fallback to simple circle if sprite not loaded
      ctx.save();
      ctx.fillStyle = this.isAttached ? "#ff3333" : "#3333ff";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}