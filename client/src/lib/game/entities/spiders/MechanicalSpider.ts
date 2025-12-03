
import { ISpider } from "../../core/interfaces/ISpider";
import { IEnemy } from "../../core/interfaces/IEnemy";
import { AnimationManager } from "../../rendering/AnimationManager";

export class MechanicalSpider implements ISpider {
  public x: number;
  public y: number;
  public width = 120;
  public height = 68;
  public instanceId: string;
  public currentAnimation = "spider_idle";
  public lastDirection = { x: 0, y: 1 };

  private vx = 0;
  private vy = 0;
  private speed = 150;
  private alive = true;
  private target: IEnemy | null = null;
  private attachedToEnemy = false;
  private damage = 2;
  private damageTimer = 0;
  private damageCooldown = 0.5;
  private searchRadius = 120;
  private spiderMode: "normal" | "big" | "small" = "normal";
  private maxHealth = 1;
  private isJumping = false;
  private jumpStartPos = { x: 0, y: 0 };
  private jumpTargetPos = { x: 0, y: 0 };
  private jumpProgress = 0;
  private jumpDuration = 0.4;
  private jumpHeight = 50;
  private animationManager: AnimationManager;
  private lastAnimationFrame: any = null;
  private lastAnimationSwitch = 0;

  constructor(x: number, y: number, mode: "normal" | "big" | "small" = "normal") {
    this.x = x;
    this.y = y;
    this.spiderMode = mode;
    this.instanceId = `mechanical_spider_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();

    this.applyModeStats();
    this.setupAnimations();
  }

  private applyModeStats() {
    switch (this.spiderMode) {
      case "big":
        this.damage = 8;
        this.maxHealth = 3;
        this.damageCooldown = 0.3;
        this.speed = 120;
        this.searchRadius = 150;
        this.width = 160;
        this.height = 90;
        break;
      case "small":
        this.damage = 1;
        this.maxHealth = 1;
        this.damageCooldown = 0.8;
        this.speed = 200;
        this.searchRadius = 100;
        this.width = 80;
        this.height = 45;
        break;
      default:
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
    const walkFrames = [];
    for (let i = 0; i < 30; i++) {
      walkFrames.push({
        x: i * 800,
        y: 0,
        width: 800,
        height: 450
      });
    }

    const idleFrames = [{ x: 0, y: 0, width: 800, height: 450 }];

    const jumpingFrames = [];
    const jumpFrameWidth = 1408 / 4;
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
    this.animationManager.addAnimation("spider_jumping", jumpingFrames, 0.1, false);

    this.lastAnimationFrame = idleFrames[0];
    this.animationManager.startAnimation("spider_idle", this.instanceId);
  }

  public update(deltaTime: number, enemies: IEnemy[], playerPos: { x: number; y: number }) {
    if (!this.alive) return;

    let targetAnimation = "spider_idle";

    if (this.attachedToEnemy && this.target) {
      this.damageTimer += deltaTime;

      if (!this.target.isAlive()) {
        this.attachedToEnemy = false;
        this.target = null;
        return;
      }

      if (this.x !== this.target.x || this.y !== this.target.y) {
        this.x = this.target.x;
        this.y = this.target.y;
      }

      if (this.damageTimer >= this.damageCooldown) {
        this.target.takeDamage(this.damage);
        this.damageTimer = 0;
      }

      targetAnimation = "spider_idle";
    } else {
      if (!this.target || !this.target.isAlive()) {
        this.findNearestEnemy(enemies, playerPos);
      }

      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 35) {
          this.attachedToEnemy = true;
          this.isJumping = false;
          this.x = this.target.x;
          this.y = this.target.y;
        } else if (this.isJumping) {
          this.jumpProgress += deltaTime / this.jumpDuration;

          if (this.jumpProgress >= 1) {
            this.x = this.jumpTargetPos.x;
            this.y = this.jumpTargetPos.y;
            this.isJumping = false;
            this.jumpProgress = 0;

            if (this.target && this.target.isAlive()) {
              const finalDx = this.target.x - this.x;
              const finalDy = this.target.y - this.y;
              const finalDistance = Math.sqrt(finalDx * finalDx + finalDy * finalDy);

              if (finalDistance < 35) {
                this.attachedToEnemy = true;
                this.x = this.target.x;
                this.y = this.target.y;
              }
            }

            targetAnimation = "spider_idle";
          } else {
            const t = this.jumpProgress;
            const newX = this.jumpStartPos.x + (this.jumpTargetPos.x - this.jumpStartPos.x) * t;
            const newY = this.jumpStartPos.y + (this.jumpTargetPos.y - this.jumpStartPos.y) * t;

            if (Math.abs(newX - this.x) > 1 || Math.abs(newY - this.y) > 1) {
              this.x = newX;
              this.y = newY;
            }

            if (this.jumpProgress < 0.1) {
              this.lastDirection.x = (this.jumpTargetPos.x - this.jumpStartPos.x) / distance;
              this.lastDirection.y = (this.jumpTargetPos.y - this.jumpStartPos.y) / distance;
            }

            targetAnimation = "spider_jumping";
          }
        } else {
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

    if (this.currentAnimation !== targetAnimation) {
      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
      this.lastAnimationSwitch = Date.now();
    }
  }

  private findNearestEnemy(enemies: IEnemy[], playerPos: { x: number; y: number }) {
    let nearestEnemy: IEnemy | null = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      const dx = enemy.x - playerPos.x;
      const dy = enemy.y - playerPos.y;
      const distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);

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
    return this.attachedToEnemy;
  }

  public get health(): number {
    return this.target?.getHealth() || 0;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    const spriteManager = require("../../rendering/SpriteManager").SpriteManager.getInstance();
    
    // Update animation
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
    const frame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);
    
    if (frame) {
      this.lastAnimationFrame = frame;
    }

    // Get sprite based on current animation
    let spriteName = "spider_down";
    if (this.currentAnimation === "spider_jumping") {
      spriteName = "spider_jumping";
    } else if (Math.abs(this.lastDirection.y) > Math.abs(this.lastDirection.x)) {
      spriteName = this.lastDirection.y < 0 ? "spider_up" : "spider_down";
    } else if (Math.abs(this.lastDirection.y) > 0) {
      spriteName = this.lastDirection.y < 0 ? "spider_diagonal_up" : "spider_diagonal_down";
    } else {
      spriteName = "spider_side";
    }

    const sprite = spriteManager.getSprite(spriteName);
    if (!sprite) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    const aspectRatio = sprite.width / sprite.height;
    const drawHeight = this.height;
    const drawWidth = drawHeight * aspectRatio;
    const drawX = screenX - drawWidth / 2;
    const drawY = screenY - drawHeight / 2;

    ctx.save();
    
    // Flip sprite if moving left
    if (this.lastDirection.x < 0) {
      ctx.translate(screenX, screenY);
      ctx.scale(-1, 1);
      ctx.translate(-screenX, -screenY);
    }

    try {
      if (frame && sprite) {
        ctx.drawImage(
          sprite,
          frame.x, frame.y,
          frame.width, frame.height,
          drawX, drawY,
          drawWidth, drawHeight
        );
      } else if (sprite) {
        ctx.drawImage(
          sprite,
          0, 0,
          sprite.width, sprite.height,
          drawX, drawY,
          drawWidth, drawHeight
        );
      }
    } catch (error) {
      // Fallback rendering
      ctx.fillStyle = this.attachedToEnemy ? "#ff4444" : "#4444ff";
      ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }
}
