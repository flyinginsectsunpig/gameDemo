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
  }

  

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();

    // Choose sprite based on actual movement direction (more accurate)
    let spriteName = "spider_down";
    const absX = Math.abs(this.lastDirection.x);
    const absY = Math.abs(this.lastDirection.y);

    if (this.isAttached && this.target) {
      // Use jumping sprite when attached
      spriteName = "spider_jumping";
    } else if (this.currentAnimation === "spider_idle") {
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

    const sprite = spriteManager.getSprite(spriteName);

    if (sprite) {
      ctx.save();

      // Update animation frame
      const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
      const currentFrame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);

      if (currentFrame) {
        this.lastAnimationFrame = currentFrame;
      }

      // Apply visual effects based on spider state
      if (this.isAttached) {
        // Pulsing red tint when attached and dealing damage
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
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

      // Verify sprite is loaded and has valid dimensions
      if (!sprite.complete || sprite.naturalWidth === 0 || sprite.naturalHeight === 0) {
        console.warn("Spider sprite not fully loaded, using fallback");
        this.renderFallbackSpider(ctx, cameraX, cameraY);
        ctx.restore();
        return;
      }

      try {
        // Reset any problematic context properties
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        ctx.imageSmoothingEnabled = true;
        
        // Debug sprite dimensions
        if (sprite.naturalWidth === 0 || sprite.naturalHeight === 0) {
          console.warn(`Spider sprite ${spriteName} has invalid dimensions: ${sprite.naturalWidth}x${sprite.naturalHeight}`);
          this.renderFallbackSpider(ctx, cameraX, cameraY);
          ctx.restore();
          return;
        }
        
        // Draw using animation frame coordinates
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
          // Fallback - use first frame (800x450)
          ctx.drawImage(
            sprite,
            0, 0, 800, 450,
            shouldFlip ? -renderX - this.width : renderX,
            renderY,
            this.width,
            this.height
          );
        }
      } catch (error) {
        console.error("Error drawing spider sprite:", error, spriteName);
        // Fallback to shape rendering
        this.renderFallbackSpider(ctx, cameraX, cameraY);
      }

      ctx.restore();
    } else {
      // Fallback to detailed shape if sprite not loaded
      this.renderFallbackSpider(ctx, cameraX, cameraY);
    }
  }

  private renderFallbackSpider(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    
    // Create a more detailed spider shape instead of just a circle
    const centerX = this.x - cameraX;
    const centerY = this.y - cameraY;
    const size = 24;
    
    if (this.isAttached) {
      // Red spider when attached to enemy
      ctx.fillStyle = "#ff4444";
      ctx.strokeStyle = "#ff0000";
      ctx.shadowColor = "#ff3333";
      ctx.shadowBlur = 8;
    } else {
      // Blue/cyan spider when searching/moving
      ctx.fillStyle = "#4444ff";
      ctx.strokeStyle = "#0000ff";
      ctx.shadowColor = "#3333ff";
      ctx.shadowBlur = 4;
    }
    
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    
    // Draw spider body (oval)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw spider legs (8 legs)
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const legLength = size * 1.5;
      const legX = centerX + Math.cos(angle) * legLength;
      const legY = centerY + Math.sin(angle) * legLength;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(legX, legY);
      ctx.stroke();
    }
    
    // Add pulsing effect when attached
    if (this.isAttached) {
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ffaaaa";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}