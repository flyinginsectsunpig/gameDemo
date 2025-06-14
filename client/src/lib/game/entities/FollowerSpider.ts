
import { GameObject } from "./Player";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

// Global spider tracking for debugging
let globalSpiderCount = 0;

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
  private optimalDistance = 80; // Preferred distance from player (closer)
  private followThreshold = 150; // Threshold to start following
  private minimumDistance = 40; // Minimum distance to maintain from player

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.instanceId = `follower_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();
    
    globalSpiderCount++;
    console.log(`[${this.instanceId}] Spider created. Global count: ${globalSpiderCount}`);
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

    // Debug: Log position and distance occasionally
    if (Math.random() < 0.02) {
      console.log(`[${this.instanceId}] Spider at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), Player at (${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(1)}), Distance: ${distance.toFixed(1)}`);
    }

    let targetAnimation = "spider_idle";
    
    // If too close to player, move away
    if (distance < this.minimumDistance) {
      // Move away from player
      this.vx = -(dx / distance) * this.speed * 0.6;
      this.vy = -(dy / distance) * this.speed * 0.6;
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      
      // Update direction for sprite selection (moving away)
      this.lastDirection.x = -dx / distance;
      this.lastDirection.y = -dy / distance;
      
      // Choose animation based on movement direction
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);
      
      if (absY > 0.7) {
        targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.7) {
        targetAnimation = "spider_walk_side";
      } else {
        targetAnimation = "spider_walk_diagonal";
      }
    } else if (distance > this.optimalDistance) {
      // Spider is too far, move towards player
      // Calculate speed based on distance - further away = faster movement
      const distanceRatio = Math.min(distance / this.optimalDistance, 3.0); // Allow up to 3x speed for very far distances
      const adjustedSpeed = this.speed * distanceRatio;
      
      // Normalize direction vector
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Move towards player
      this.vx = normalizedDx * adjustedSpeed;
      this.vy = normalizedDy * adjustedSpeed;
      
      // Update direction for sprite selection
      this.lastDirection.x = normalizedDx;
      this.lastDirection.y = normalizedDy;
      
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;

      // Choose animation based on movement direction
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);
      
      if (absY > 0.7) {
        targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.7) {
        targetAnimation = "spider_walk_side";
      } else {
        targetAnimation = "spider_walk_diagonal";
      }
    } else {
      // Within acceptable range - mostly idle with slight movement towards optimal position
      const targetX = playerPos.x - this.optimalDistance * 0.7; // Stay slightly behind player
      const targetY = playerPos.y;
      
      const targetDx = targetX - this.x;
      const targetDy = targetY - this.y;
      const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
      
      if (targetDistance > 10) {
        // Gentle movement towards ideal position
        this.vx = (targetDx / targetDistance) * this.speed * 0.3;
        this.vy = (targetDy / targetDistance) * this.speed * 0.3;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update direction
        this.lastDirection.x = targetDx / targetDistance;
        this.lastDirection.y = targetDy / targetDistance;
        
        // Choose walking animation
        const absX = Math.abs(this.lastDirection.x);
        const absY = Math.abs(this.lastDirection.y);
        
        if (absY > 0.7) {
          targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
        } else if (absX > 0.7) {
          targetAnimation = "spider_walk_side";
        } else {
          targetAnimation = "spider_walk_diagonal";
        }
      } else {
        // Close enough to ideal position - stay idle
        this.vx *= 0.8;
        this.vy *= 0.8;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        targetAnimation = "spider_idle";
      }
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
  
  public destroy() {
    if (this.alive) {
      this.alive = false;
      globalSpiderCount--;
      console.log(`[${this.instanceId}] Spider destroyed. Global count: ${globalSpiderCount}`);
    }
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
      
      // Debug: log render calls to detect double rendering
      if (Math.random() < 0.1) {
        console.log(`[${this.instanceId}] Rendering spider at (${renderX}, ${renderY}) - direction: (${this.lastDirection.x.toFixed(2)}, ${this.lastDirection.y.toFixed(2)})`);
      }

      if (frameToUse) {
        // Flip sprite horizontally if moving left (for sideways movement)
        const shouldFlip = this.lastDirection.x < -0.3;
        
        if (shouldFlip) {
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
        const shouldFlip = this.lastDirection.x < -0.3;
        
        if (shouldFlip) {
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
