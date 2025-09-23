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
  private spiderMode: "normal" | "big" | "small" = "normal";
  private maxHealth = 1;
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
  constructor(x: number, y: number, mode: "normal" | "big" | "small" = "normal") {
    this.x = x;
    this.y = y;
    this.spiderMode = mode;
    this.instanceId = `mechanical_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    
    // Set stats based on mode
    this.applyModeStats();
    this.setupAnimations();
  }

  private applyModeStats() {
    switch (this.spiderMode) {
      case "big":
        this.damage = 8; // Much higher damage
        this.maxHealth = 3; // More durable
        this.damageCooldown = 0.3; // Faster attack rate
        this.speed = 120; // Slightly slower
        this.searchRadius = 150; // Larger search radius
        this.width = 160; // Bigger size
        this.height = 90;
        break;
      case "small":
        this.damage = 1; // Lower damage
        this.maxHealth = 1; // Dies in one hit
        this.damageCooldown = 0.8; // Slower attack rate
        this.speed = 200; // Much faster
        this.searchRadius = 100; // Smaller search radius
        this.width = 80; // Smaller size
        this.height = 45;
        break;
      default: // normal
        this.damage = 2;
        this.maxHealth = 1;
        this.damageCooldown = 0.5;
        this.speed = 150;
        this.searchRadius = 120;
        this.width = 120;
        this.height = 68;
        break;
    }
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
    let positionChanged = false;

    if (this.isAttached && this.target) {
      // Spider is attached to enemy - deal damage over time
      this.damageTimer += deltaTime;

      if (!this.target.isAlive()) {
        // When target dies, detach and find new target
        this.isAttached = false;
        this.target = null;
        return;
      }

      // Follow the target enemy only if position actually changed
      if (this.x !== this.target.x || this.y !== this.target.y) {
        this.x = this.target.x;
        this.y = this.target.y;
        positionChanged = true;
      }

      // Deal damage periodically
      if (this.damageTimer >= this.damageCooldown) {
        this.target.takeDamage(this.damage);
        this.damageTimer = 0;
      }

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
          // Attach to enemy
          this.isAttached = true;
          this.isJumping = false;
          this.x = this.target.x;
          this.y = this.target.y;
          positionChanged = true;
        } else if (this.isJumping) {
          // Handle jumping animation
          this.jumpProgress += deltaTime / this.jumpDuration;
          
          if (this.jumpProgress >= 1) {
            // Jump complete
            this.x = this.jumpTargetPos.x;
            this.y = this.jumpTargetPos.y;
            this.isJumping = false;
            this.jumpProgress = 0;
            positionChanged = true;
            
            // Check for immediate attachment
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
            // Smooth interpolation during jump
            const t = this.jumpProgress;
            const newX = this.jumpStartPos.x + (this.jumpTargetPos.x - this.jumpStartPos.x) * t;
            const newY = this.jumpStartPos.y + (this.jumpTargetPos.y - this.jumpStartPos.y) * t;
            
            if (Math.abs(newX - this.x) > 1 || Math.abs(newY - this.y) > 1) {
              this.x = newX;
              this.y = newY;
              positionChanged = true;
            }
            
            // Only update direction when starting jump or major direction change
            if (this.jumpProgress < 0.1) {
              this.lastDirection.x = (this.jumpTargetPos.x - this.jumpStartPos.x) / distance;
              this.lastDirection.y = (this.jumpTargetPos.y - this.jumpStartPos.y) / distance;
            }
            
            targetAnimation = "spider_jumping";
          }
        } else {
          // Start jumping
          this.isJumping = true;
          this.jumpStartPos = { x: this.x, y: this.y };
          this.jumpTargetPos = { x: this.target.x, y: this.target.y };
          this.jumpProgress = 0;
          
          this.lastDirection.x = dx / distance;
          this.lastDirection.y = dy / distance;
          
          targetAnimation = "spider_jumping";
        }
      } else {
        targetAnimation = "spider_idle";
      }
    }

    // Only switch animation when absolutely necessary
    if (this.currentAnimation !== targetAnimation) {
      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
      this.lastAnimationSwitch = Date.now();
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

  public get isAttached(): boolean {
    return this.isAttached;
  }

  public get health(): number {
    return this.target?.health || 0;
  }

  

  

  

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    // Spider rendering is handled by InfiniteTileRenderer to prevent double rendering
    // and eliminate afterimage/black square issues
    return;
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