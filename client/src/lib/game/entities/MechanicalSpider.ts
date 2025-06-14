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

    this.animationManager.addAnimation("spider_idle", idleFrames, 0.5, true);
    this.animationManager.addAnimation("spider_walk_down", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_up", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_side", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_walk_diagonal", walkFrames, 0.05, true);
    this.animationManager.addAnimation("spider_jumping", walkFrames, 0.03, true);

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

        if (distance < 20) {
          // Attach to enemy
          this.isAttached = true;
          this.isJumping = false;
        } else if (this.isJumping) {
          // Handle jumping animation
          this.jumpProgress += deltaTime / this.jumpDuration;
          
          if (this.jumpProgress >= 1) {
            // Jump complete - arrive at target
            this.x = this.jumpTargetPos.x;
            this.y = this.jumpTargetPos.y;
            this.isJumping = false;
            this.jumpProgress = 0;
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
        } else if (distance > 60) {
          // Start jump if enemy is far enough
          this.isJumping = true;
          this.jumpStartPos = { x: this.x, y: this.y };
          this.jumpTargetPos = { x: this.target.x, y: this.target.y };
          this.jumpProgress = 0;
          
          // Update direction for sprite selection
          this.lastDirection.x = dx / distance;
          this.lastDirection.y = dy / distance;
          
          targetAnimation = "spider_jumping";
        } else {
          // Walk normally when close to target
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

  private findNearestEnemy(enemies: Enemy[], playerPos: { x: number; y: number }) {
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = this.searchRadius;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      // Check if enemy is within radius of player, not spider
      const dx = enemy.x - playerPos.x;
      const dy = enemy.y - playerPos.y;
      const distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);

      if (distanceFromPlayer < nearestDistance) {
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

    // Simple circle rendering for testing
    ctx.save();
    
    // Don't apply camera offset here - it should be handled by the parent rendering context
    const centerX = this.x;
    // Add jump height effect during jumping
    let jumpOffset = 0;
    if (this.isJumping) {
      // Create arc effect - highest at middle of jump
      const t = this.jumpProgress;
      jumpOffset = -this.jumpHeight * Math.sin(t * Math.PI);
    }
    const centerY = this.y + jumpOffset;
    const radius = 30;
    
    // Different colors based on spider state
    if (this.isAttached && this.target) {
      // Red when attached and dealing damage
      ctx.fillStyle = "#ff0000";
      ctx.strokeStyle = "#ff6666";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 10;
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
    } else if (this.isJumping) {
      // Yellow/orange when jumping
      ctx.fillStyle = "#ffaa00";
      ctx.strokeStyle = "#ff8800";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 1.0;
    } else {
      // Blue when searching/moving
      ctx.fillStyle = "#0066ff";
      ctx.strokeStyle = "#3399ff";
      ctx.shadowColor = "#0066ff";
      ctx.shadowBlur = 5;
      ctx.globalAlpha = 1.0;
    }
    
    ctx.lineWidth = 3;
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Add a white center dot for visibility
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add direction indicator (small line showing movement direction)
    if (this.lastDirection.x !== 0 || this.lastDirection.y !== 0) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + this.lastDirection.x * radius * 0.8,
        centerY + this.lastDirection.y * radius * 0.8
      );
      ctx.stroke();
    }
    
    // Add shadow when jumping
    if (this.isJumping) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, radius * 0.8, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
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