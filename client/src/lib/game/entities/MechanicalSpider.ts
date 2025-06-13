
import { GameObject } from "./Player";
import { Enemy } from "./Enemy";
import { SpriteManager } from "../rendering/SpriteManager";

export class MechanicalSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 32;
  public height = 32;
  private vx = 0;
  private vy = 0;
  private speed = 150;
  private alive = true;
  private lifetime = 20; // seconds
  private target: Enemy | null = null;
  private isAttached = false;
  private damage = 2;
  private damageTimer = 0;
  private damageCooldown = 0.5; // damage every 0.5 seconds
  private attachedLifetime = 8; // how long spider stays attached
  private searchRadius = 120;
  private animationTimer = 0;
  private animationFrame = 0;
  private lastDirection = { x: 0, y: 1 }; // Track movement direction for sprite selection

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    this.lifetime -= deltaTime;
    this.animationTimer += deltaTime;
    
    if (this.lifetime <= 0) {
      this.alive = false;
      return;
    }

    // Animation frame cycling
    if (this.animationTimer >= 0.2) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }

    if (this.isAttached && this.target) {
      // Spider is attached to enemy - deal damage over time
      this.damageTimer += deltaTime;
      this.attachedLifetime -= deltaTime;

      if (!this.target.isAlive() || this.attachedLifetime <= 0) {
        this.alive = false;
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
          this.attachedLifetime = 8;
        } else {
          // Move towards target
          this.vx = (dx / distance) * this.speed;
          this.vy = (dy / distance) * this.speed;
          
          // Update direction for sprite selection
          this.lastDirection.x = dx / distance;
          this.lastDirection.y = dy / distance;
          
          this.x += this.vx * deltaTime;
          this.y += this.vy * deltaTime;
        }
      } else {
        // No target found - move randomly around player
        const angleToPlayer = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
        const distanceToPlayer = Math.sqrt((playerPos.x - this.x) ** 2 + (playerPos.y - this.y) ** 2);
        
        if (distanceToPlayer > 100) {
          // Move back towards player
          this.vx = Math.cos(angleToPlayer) * this.speed * 0.5;
          this.vy = Math.sin(angleToPlayer) * this.speed * 0.5;
          
          // Update direction
          this.lastDirection.x = Math.cos(angleToPlayer);
          this.lastDirection.y = Math.sin(angleToPlayer);
        } else {
          // Random movement around player
          this.vx += (Math.random() - 0.5) * 50;
          this.vy += (Math.random() - 0.5) * 50;
          
          // Limit velocity
          const vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (vel > this.speed * 0.3) {
            this.vx = (this.vx / vel) * this.speed * 0.3;
            this.vy = (this.vy / vel) * this.speed * 0.3;
          }
          
          // Update direction if moving
          if (vel > 0) {
            this.lastDirection.x = this.vx / vel;
            this.lastDirection.y = this.vy / vel;
          }
        }
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
      }
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
      
      if (absY > absX) {
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
    }

    const sprite = spriteManager.getSprite(spriteName);
    
    if (sprite) {
      ctx.save();
      
      // Apply visual effects based on spider state
      if (this.isAttached) {
        // Pulsing red tint when attached and dealing damage
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.filter = 'hue-rotate(0deg) saturate(2) brightness(1.2)';
        ctx.shadowColor = "#ff3333";
        ctx.shadowBlur = 8;
      } else {
        // Normal appearance when searching
        ctx.shadowColor = "#333333";
        ctx.shadowBlur = 4;
      }

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
      ctx.fillStyle = this.isAttached ? "#ff3333" : "#666666";
      ctx.beginPath();
      ctx.arc(this.x - cameraX, this.y - cameraY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
