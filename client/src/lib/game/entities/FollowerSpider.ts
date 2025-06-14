
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
  private speed = 200; // Slightly faster for better following
  private alive = true;
  private lastDirection = { x: 0, y: 1 }; // Track movement direction for sprite selection
  private animationManager: AnimationManager;
  private instanceId: string;
  private currentAnimation = "spider_idle";
  private lastAnimationFrame: any = null;
  private lastAnimationSwitch = 0; // For animation debouncing
  private optimalDistance = 90; // Preferred distance from player
  private followThreshold = 140; // Threshold to start following aggressively  
  private minimumDistance = 50; // Minimum distance to maintain from player

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

    // Debug: Log position and distance occasionally (reduced frequency)
    if (Math.random() < 0.001) {
      console.log(`[${this.instanceId}] Spider at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), Player at (${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(1)}), Distance: ${distance.toFixed(1)}`);
    }

    let targetAnimation = "spider_idle";
    let isMoving = false;
    
    // Simplified movement logic with division by zero guard
    const safeDistance = distance || 0.0001; // Prevent divide by zero
    const normalizedDx = dx / safeDistance;
    const normalizedDy = dy / safeDistance;
    
    // Use wider dead zone to prevent oscillation
    const deadZone = 15; // Larger dead zone around optimal distance
    
    if (distance < this.minimumDistance) {
      // Too close - move away
      this.vx = -normalizedDx * this.speed * 0.8;
      this.vy = -normalizedDy * this.speed * 0.8;
      isMoving = true;
      
    } else if (distance > this.followThreshold) {
      // Too far - move aggressively toward player
      const urgency = Math.min((distance - this.followThreshold) / 100, 2.0);
      this.vx = normalizedDx * this.speed * (1.0 + urgency);
      this.vy = normalizedDy * this.speed * (1.0 + urgency);
      isMoving = true;
      
    } else if (Math.abs(distance - this.optimalDistance) > deadZone) {
      // Outside dead zone - move toward optimal distance
      const distanceError = distance - this.optimalDistance;
      const moveIntensity = Math.min(Math.abs(distanceError) / 50, 0.8);
      this.vx = normalizedDx * this.speed * Math.sign(distanceError) * moveIntensity;
      this.vy = normalizedDy * this.speed * Math.sign(distanceError) * moveIntensity;
      isMoving = true;
      
    } else {
      // In dead zone - apply strong decay to stop micro-movements
      const decay = Math.pow(0.5, deltaTime * 60); // Stronger decay
      this.vx *= decay;
      this.vy *= decay;
      
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      isMoving = currentSpeed > 20; // Higher threshold for "moving"
    }
    
    // Update movement direction for animation with stability threshold
    if (isMoving) {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 20) { // Only update direction if moving with significant speed
        this.lastDirection.x = this.vx / speed;
        this.lastDirection.y = this.vy / speed;
      }
    }
    
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Determine animation based on movement state and direction with hysteresis
    if (isMoving) {
      const absX = Math.abs(this.lastDirection.x);
      const absY = Math.abs(this.lastDirection.y);
      
      // Use clearer thresholds for animation selection with hysteresis to prevent flickering
      if (absY > 0.7) {
        // Primarily vertical movement
        targetAnimation = this.lastDirection.y > 0 ? "spider_walk_down" : "spider_walk_up";
      } else if (absX > 0.7) {
        // Primarily horizontal movement
        targetAnimation = "spider_walk_side";
      } else if (absX > 0.4 && absY > 0.4) {
        // Diagonal movement
        targetAnimation = "spider_walk_diagonal";
      } else {
        // Default movement animation - stick with current if already moving
        targetAnimation = this.currentAnimation.includes("walk") ? this.currentAnimation : "spider_walk_down";
      }
    } else {
      targetAnimation = "spider_idle";
    }

    // Only switch animation if it's different and add debounce to prevent rapid switching
    if (this.currentAnimation !== targetAnimation && performance.now() - this.lastAnimationSwitch > 100) {
      this.currentAnimation = targetAnimation;
      this.lastAnimationSwitch = performance.now();
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
      if (Math.random() < 0.01) { // Further reduce console spam
        console.log(`Spider switching to animation: ${targetAnimation}`);
      }
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
        // Debug: log frame position occasionally
        if (Math.random() < 0.001) {
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
      
      // Debug: log render calls occasionally
      if (Math.random() < 0.001) {
        console.log(`[${this.instanceId}] Rendering spider at (${renderX}, ${renderY}) - direction: (${this.lastDirection.x.toFixed(2)}, ${this.lastDirection.y.toFixed(2)})`);
      }

      // Consolidate flipping logic
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
