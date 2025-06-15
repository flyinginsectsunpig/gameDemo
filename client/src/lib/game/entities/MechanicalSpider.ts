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
  private isJumping = false;
  private jumpStartPos = { x: 0, y: 0 };
  private jumpTargetPos = { x: 0, y: 0 };
  private jumpProgress = 0;
  private jumpDuration = 0.4; // 400ms jump duration
  private jumpHeight = 50; // pixels above ground during jump
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

    // Jumping animation - 4 stages from the 1408x272 spritesheet
    // Stage 1: idle, Stage 2: jumping, Stage 3: landing, Stage 4: idle again
    const jumpingFrames = [];
    const jumpFrameWidth = 1408 / 4; // 352px per frame
    for (let i = 0; i < 4; i++) {
      jumpingFrames.push({
        x: i * jumpFrameWidth,
        y: 0,
        width: jumpFrameWidth,
        height: 272
      });
    }

    this.animationManager.addAnimation("spider_idle", idleFrames, 0.5, true);
    this.animationManager.addAnimation("spider_walk_down", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_up", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_side", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_diagonal", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_jumping", jumpingFrames, 0.1, false); // Don't loop, play once

    this.lastAnimationFrame = idleFrames[0];
    
    // Start with idle animation
    this.animationManager.startAnimation("spider_idle", this.instanceId);
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
        this.findNearestEnemy(enemies, playerPos);
      }

      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 35) {
          // Attach to enemy (increased range to prevent bouncing)
          this.isAttached = true;
          this.isJumping = false;
          // Snap to enemy position when attaching
          this.x = this.target.x;
          this.y = this.target.y;
        } else if (this.isJumping) {
          // Handle jumping animation
          this.jumpProgress += deltaTime / this.jumpDuration;
          
          if (this.jumpProgress >= 1) {
            // Jump complete - arrive at target and check for immediate attachment
            this.x = this.jumpTargetPos.x;
            this.y = this.jumpTargetPos.y;
            this.isJumping = false;
            this.jumpProgress = 0;
            
            // Check if we can immediately attach after landing
            if (this.target && this.target.isAlive()) {
              const finalDx = this.target.x - this.x;
              const finalDy = this.target.y - this.y;
              const finalDistance = Math.sqrt(finalDx * finalDx + finalDy * finalDy);
              
              if (finalDistance < 35) {
                this.isAttached = true;
                this.x = this.target.x;
                this.y = this.target.y;
              }
            }
            
            targetAnimation = "spider_idle";
          } else {
            // Interpolate position during jump with arc
            const t = this.jumpProgress;
            this.x = this.jumpStartPos.x + (this.jumpTargetPos.x - this.jumpStartPos.x) * t;
            this.y = this.jumpStartPos.y + (this.jumpTargetPos.y - this.jumpStartPos.y) * t;
            
            // Update direction for sprite selection
            this.lastDirection.x = (this.jumpTargetPos.x - this.jumpStartPos.x) / distance;
            this.lastDirection.y = (this.jumpTargetPos.y - this.jumpStartPos.y) / distance;
            
            targetAnimation = "spider_jumping";
          }
        } else {
          // Always jump to enemies near the player, regardless of spider's current position
          this.isJumping = true;
          this.jumpStartPos = { x: this.x, y: this.y };
          
          // Jump directly to the enemy's position (they're already verified to be within player's radius)
          this.jumpTargetPos = { x: this.target.x, y: this.target.y };
          this.jumpProgress = 0;
          
          // Update direction for sprite selection
          this.lastDirection.x = dx / distance;
          this.lastDirection.y = dy / distance;
          
          targetAnimation = "spider_jumping";
        
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

  private findNearestEnemy(enemies: Enemy[], playerPos: { x: number; y: number }) {
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      // Check if enemy is within radius of player
      const dx = enemy.x - playerPos.x;
      const dy = enemy.y - playerPos.y;
      const distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);

      // Only consider enemies within player's radius
      if (distanceFromPlayer <= this.searchRadius && distanceFromPlayer < nearestDistance) {
        nearestDistance = distanceFromPlayer;
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

    // This method should not be called if the spider is properly registered with tile renderer
    // The tile renderer handles all sprite-based rendering
    // This is kept as a fallback only
    console.warn("Spider render method called - should be handled by tile renderer");
    
    // Minimal fallback rendering - just a small indicator
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderFallbackSpider(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    
    // Create a more detailed spider shape instead of just a circle
    const centerX = this.x - cameraX;
    const centerY = this.y - cameraY;
    const size = 32; // Increased size for better visibility
    
    if (this.isAttached) {
      // Red spider when attached to enemy
      ctx.fillStyle = "#ff4444";
      ctx.strokeStyle = "#ff0000";
      ctx.shadowColor = "#ff3333";
      ctx.shadowBlur = 10;
    } else {
      // Blue/cyan spider when searching/moving
      ctx.fillStyle = "#4444ff";
      ctx.strokeStyle = "#0000ff";
      ctx.shadowColor = "#3333ff";
      ctx.shadowBlur = 6;
    }
    
    ctx.globalAlpha = 1.0; // Full opacity for better visibility
    ctx.lineWidth = 3;
    
    // Draw spider body (oval)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw spider legs (8 legs)
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const legLength = size * 1.8;
      const legX = centerX + Math.cos(angle) * legLength;
      const legY = centerY + Math.sin(angle) * legLength;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(legX, legY);
      ctx.stroke();
    }
    
    // Add bright center dot for visibility
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
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