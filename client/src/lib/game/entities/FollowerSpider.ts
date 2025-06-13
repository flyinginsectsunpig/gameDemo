
import { GameObject } from "./Player";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

export class FollowerSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 96; // Same size as player
  public height = 96;
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

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.instanceId = `follower_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();
  }

  private setupAnimations() {
    // Create simple 2-frame animations for each direction using the spider sprites
    const idleFrames = [
      { x: 0, y: 0, width: 32, height: 32 }
    ];

    const walkFrames = [
      { x: 0, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 }
    ];

    this.animationManager.addAnimation("spider_idle", idleFrames, 1, true);
    this.animationManager.addAnimation("spider_walk_down", walkFrames, 0.3, true);
    this.animationManager.addAnimation("spider_walk_up", walkFrames, 0.3, true);
    this.animationManager.addAnimation("spider_walk_side", walkFrames, 0.3, true);
    this.animationManager.addAnimation("spider_walk_diagonal", walkFrames, 0.3, true);

    this.lastAnimationFrame = idleFrames[0];
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    // Calculate distance to player
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let targetAnimation = "spider_idle";
    
    // Only move if we're too far from the player
    if (distance > this.followDistance) {
      // Move towards player
      this.vx = (dx / distance) * this.speed;
      this.vy = (dy / distance) * this.speed;
      
      // Update direction for sprite selection
      this.lastDirection.x = dx / distance;
      this.lastDirection.y = dy / distance;
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;

      // Determine animation based on movement direction
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);
      
      if (absY > absX) {
        // Vertical movement dominant
        targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.3) {
        // Horizontal movement
        targetAnimation = "spider_walk_side";
      } else {
        // Diagonal movement
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
    }
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (!this.alive) return;

    const spriteManager = SpriteManager.getInstance();
    
    // Determine which sprite to use based on movement direction
    let spriteName = "spider_down"; // default
    
    const absX = Math.abs(this.lastDirection.x);
    const absY = Math.abs(this.lastDirection.y);
    
    if (this.vx === 0 && this.vy === 0) {
      // Idle - use down sprite
      spriteName = "spider_down";
    } else if (absY > absX) {
      // Vertical movement dominant
      spriteName = this.lastDirection.y > 0 ? "spider_down" : "spider_up";
    } else if (absX > 0.3) {
      // Horizontal movement
      spriteName = "spider_side";
    } else {
      // Diagonal movement
      if (this.lastDirection.y > 0) {
        spriteName = "spider_diagonal_down";
      } else {
        spriteName = "spider_diagonal_up";
      }
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
      }

      // Add some visual effects to make it look magical/mechanical
      ctx.shadowColor = "#4444ff";
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.9;

      // Flip sprite horizontally if moving left
      if (this.lastDirection.x < -0.3) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          sprite,
          -(this.x - cameraX + this.width/2),
          this.y - cameraY - this.height/2,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(
          sprite,
          this.x - cameraX - this.width/2,
          this.y - cameraY - this.height/2,
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
