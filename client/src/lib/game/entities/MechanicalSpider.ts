
import { GameObject } from "./Player";
import { Enemy } from "./Enemy";

export class MechanicalSpider implements GameObject {
  public x: number;
  public y: number;
  public width = 16;
  public height = 16;
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

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;

    ctx.save();

    if (this.isAttached) {
      // Pulsing red when attached and dealing damage
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
      ctx.shadowColor = "#ff3333";
      ctx.shadowBlur = 8;
    } else {
      // Metallic spider appearance when searching
      ctx.fillStyle = "#666666";
      ctx.shadowColor = "#333333";
      ctx.shadowBlur = 4;
    }

    // Draw spider body (oval)
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw spider legs (animated)
    ctx.strokeStyle = this.isAttached ? "#ff3333" : "#444444";
    ctx.lineWidth = 2;
    
    const legOffset = Math.sin(this.animationFrame) * 2;
    
    // Draw 8 legs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const legLength = 8 + legOffset;
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + Math.cos(angle) * legLength,
        this.y + Math.sin(angle) * legLength
      );
      ctx.stroke();
    }

    // Draw eyes
    ctx.fillStyle = this.isAttached ? "#ffff00" : "#ff0000";
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 2, this.y - 2, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
