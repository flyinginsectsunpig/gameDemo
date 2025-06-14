
import { GameObject } from "./Player";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

export class FollowerSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 120; // Bigger spider size
  public height = 68; // Maintains 800:450 aspect ratio at larger scale
  private vx = 0;
  private vy = 0;
  private speed = 180; // Slightly slower than player to create following effect
  private alive = true;
  private lastDirection = { x: 0, y: 1 }; // Track movement direction for sprite selection
  private animationManager: AnimationManager;
  private instanceId: string;
  private currentAnimation = "spider_idle";
  private lastAnimationFrame: any = null;
  private followDistance = 80; // Distance to maintain from player
  private stopDistance = 60; // Distance at which spider stops moving (smaller than followDistance)
  private isMoving = false; // Track movement state to prevent flickering

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.instanceId = `follower_spider_${Date.now()}_${Math.random()}`;
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

    // Use the first frame as idle animation with longer duration
    const idleFrames = [
      { x: 0, y: 0, width: 800, height: 450 }
    ];

    this.animationManager.addAnimation("spider_idle", idleFrames, 0.5, true);
    this.animationManager.addAnimation("spider_walk_down", walkFrames, 0.05, true); // Visible but smooth animation
    this.animationManager.addAnimation("spider_walk_up", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_side", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_diagonal", walkFrames, 0.05, true);

    this.lastAnimationFrame = idleFrames[0];
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    // Calculate distance to player
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let targetAnimation = "spider_idle";
    
    // Use hysteresis to prevent flickering between moving and idle
    if (!this.isMoving && distance > this.followDistance) {
      this.isMoving = true;
    } else if (this.isMoving && distance < this.stopDistance) {
      this.isMoving = false;
    }
    
    if (this.isMoving) {
      // Move towards player
      this.vx = (dx / distance) * this.speed;
      this.vy = (dy / distance) * this.speed;
      
      // Update direction for sprite selection
      this.lastDirection.x = dx / distance;
      this.lastDirection.y = dy / distance;
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;

      // Choose animation based on movement direction with clearer thresholds
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);
      
      if (absY > 0.7) {
        // Strongly vertical movement
        targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.7) {
        // Strongly horizontal movement
        targetAnimation = "spider_walk_side";
      } else {
        // Diagonal movement (when neither direction is dominant)
        targetAnimation = "spider_walk_diagonal";
      }
    } else {
      // Close enough to player, stop moving
      this.vx = 0;
      this.vy = 0;
      targetAnimation = "spider_idle";
    }

    // Switch animation if needed
    if (this.currentAnimation !== targetAnimation) {
      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
      console.log(`Spider switching to animation: ${targetAnimation}`);
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();
    
    // Choose sprite based on current animation
    let spriteName = "spider_down"; // default
    
    if (this.currentAnimation === "spider_walk_up") {
      spriteName = "spider_up";
    } else if (this.currentAnimation === "spider_walk_side") {
      spriteName = "spider_side";
    } else if (this.currentAnimation === "spider_walk_diagonal") {
      spriteName = this.lastDirection.y > 0 ? "spider_diagonal_down" : "spider_diagonal_up";
    } else if (this.currentAnimation === "spider_walk_down" || this.currentAnimation === "spider_idle") {
      spriteName = "spider_down";
    }
    
    const sprite = spriteManager.getSprite(spriteName);
    
    if (sprite) {
      ctx.save();
      
      // Update and get current animation frame
      const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
      const currentFrame = this.animationManager.update(
        validDeltaTime,
        this.instanceId,
        this.currentAnimation,
      );

      if (currentFrame) {
        this.lastAnimationFrame = currentFrame;
        // Debug: log frame position more frequently to track animation
        if (Math.random() < 0.2) {
          console.log(`Spider frame: x=${currentFrame.x}, animation=${this.currentAnimation}, frameIndex: ${Math.floor(currentFrame.x / 800)}`);
        }
      }

      // Add some visual effects to make it look magical/mechanical
      ctx.shadowColor = "#4444ff";
      ctx.shadowBlur = 4;
      ctx.globalAlpha = 0.95;

      // Calculate render position
      const renderX = this.x - cameraX - this.width/2;
      const renderY = this.y - cameraY - this.height/2;

      // Use animation frame if available
      const frameToUse = currentFrame || this.lastAnimationFrame;
      
      if (frameToUse) {
        // Flip sprite horizontally if moving left
        if (this.lastDirection.x < -0.3) {
          ctx.scale(-1, 1);
          ctx.drawImage(
            sprite,
            frameToUse.x, frameToUse.y, frameToUse.width, frameToUse.height,
            -renderX - this.width,
            renderY,
            this.width,
            this.height
          );
        } else {
          ctx.drawImage(
            sprite,
            frameToUse.x, frameToUse.y, frameToUse.width, frameToUse.height,
            renderX,
            renderY,
            this.width,
            this.height
          );
        }
      } else {
        // Fallback to full sprite
        if (this.lastDirection.x < -0.3) {
          ctx.scale(-1, 1);
          ctx.drawImage(
            sprite,
            -renderX - this.width,
            renderY,
            this.width,
            this.height
          );
        } else {
          ctx.drawImage(
            sprite,
            renderX,
            renderY,
            this.width,
            this.height
          );
        }
      }

      ctx.restore();
    } else {
      // Fallback to simple circle if sprite not loaded
      ctx.save();
      ctx.fillStyle = "#4444ff";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
