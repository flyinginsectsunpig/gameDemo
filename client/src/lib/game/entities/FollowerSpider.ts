import { GameObject } from "./Player";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

// Global spider tracking for debugging
let globalSpiderCount = 0;

export class FollowerSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 120;
  public height = 68;
  private vx = 0;
  private vy = 0;
  private speed = 180;
  private alive = true;
  private lastDirection = { x: 0, y: 1 };
  private animationManager: AnimationManager;
  private instanceId: string;
  private currentAnimation = "spider_idle";
  private lastAnimationFrame: any = null;
  private lastAnimationSwitch = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.instanceId = `follower_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();

    globalSpiderCount++;
    console.log(`[${this.instanceId}] Spider created at (${x}, ${y}). Global count: ${globalSpiderCount}`);
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

  public update(deltaTime: number, playerPos: { x: number; y: number }, playerDirection?: { x: number; y: number }, playerMoving?: boolean) {
    if (!this.alive) return;

    let targetAnimation = "spider_idle";

    // Duplicate player movement exactly
    if (playerMoving && playerDirection) {
      // Copy player's exact position with small offset to distinguish visually
      this.x = playerPos.x + 5; // Small offset so it's not exactly on top
      this.y = playerPos.y + 5;

      // Copy player's movement direction
      this.lastDirection.x = playerDirection.x;
      this.lastDirection.y = playerDirection.y;

      // Set velocity to match player movement pattern
      this.vx = playerDirection.x * this.speed;
      this.vy = playerDirection.y * this.speed;

      // Choose animation based on player's movement direction
      const absX = Math.abs(playerDirection.x);
      const absY = Math.abs(playerDirection.y);

      if (absY > 0.6) {
        targetAnimation = playerDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.6) {
        targetAnimation = "spider_walk_side";
      } else {
        targetAnimation = "spider_walk_diagonal";
      }
    } else {
      // Player is idle, spider should be idle too
      this.vx = 0;
      this.vy = 0;
      targetAnimation = "spider_idle";
      
      // Still maintain position near player when idle
      this.x = playerPos.x + 5;
      this.y = playerPos.y + 5;
    }

    // Update animation
    if (this.currentAnimation !== targetAnimation && performance.now() - this.lastAnimationSwitch > 100) {
      this.currentAnimation = targetAnimation;
      this.lastAnimationSwitch = performance.now();
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy() {
    if (this.alive) {
      this.alive = false;
      globalSpiderCount--;
      console.log(`[${this.instanceId}] Spider destroyed. Global count: ${globalSpiderCount}`);
    }
  }

  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  private shouldFlipSprite(): boolean {
    return this.lastDirection.x < -0.3;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();

    // Choose sprite based on current animation
    let spriteName = "spider_down";

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

      // Update animation frame
      const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
      const currentFrame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);

      if (currentFrame) {
        this.lastAnimationFrame = currentFrame;
      }

      // Visual effects
      ctx.shadowColor = "#4444ff";
      ctx.shadowBlur = 4;
      ctx.globalAlpha = 0.95;

      // Calculate render position
      const renderX = this.x - cameraX - this.width/2;
      const renderY = this.y - cameraY - this.height/2;

      // Use animation frame if available
      const frameToUse = currentFrame || this.lastAnimationFrame;

      // Handle sprite flipping
      const shouldFlip = this.shouldFlipSprite();

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
      ctx.fillStyle = "#4444ff";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}