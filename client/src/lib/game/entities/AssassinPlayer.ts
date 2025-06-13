
import { Player } from "./Player";
import { AssassinSpiderWeapon } from "../weapons/AssassinSpiderWeapon";
import { Enemy } from "./Enemy";
import { Projectile } from "../weapons/Projectile";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

export class AssassinPlayer extends Player {
  private spiderWeapon: AssassinSpiderWeapon;

  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 250; // Faster than base player
    this.maxHealth = 80; // Less health than base player
    this.health = this.maxHealth;
    this.spiderWeapon = new AssassinSpiderWeapon();
    
    // Ensure instanceId is set for assassin
    this.instanceId = `assassin_${Date.now()}_${Math.random()}`;
    
    // Use inherited animation system from Player - no need for custom setup
  }

  public update(deltaTime: number, input: any, canvasWidth: number, canvasHeight: number, tileRenderer: any) {
    // Handle movement
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    // Move the player
    this.x += moveX * this.speed * deltaTime;
    this.y += moveY * this.speed * deltaTime;

    // Keep player within bounds
    this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));

    // Update last move direction if player is moving
    const wasMoving = this.isMoving;
    if (moveX !== 0 || moveY !== 0) {
      this.lastMoveDirection = { x: moveX, y: moveY };
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    // Determine which animation to use based on movement (same logic as Player)
    let targetAnimation = "idle";
    if (this.isMoving) {
      if (moveY < 0 && Math.abs(moveX) > 0) {
        targetAnimation = "walk_diagonal";
      } else if (moveY > 0 && Math.abs(moveX) > 0) {
        targetAnimation = "walk_diagonal_down";
      } else if (moveY > 0) {
        targetAnimation = "walk_down";
      } else if (moveY < 0 && Math.abs(moveX) === 0) {
        targetAnimation = "walk_up";
      } else if (Math.abs(moveX) > 0 && moveY === 0) {
        targetAnimation = "walk_sideways";
      } else {
        targetAnimation = "walk";
      }
    }

    // Switch animation if needed
    if (this.currentAnimation !== targetAnimation) {
      if (targetAnimation === "idle" && this.lastAnimationFrame) {
        this.animationManager.addAnimation("idle", [this.lastAnimationFrame], 1, true);
      }
      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
    }

    // Update spider weapon
    this.spiderWeapon.updateSpiders(deltaTime, [], this.getPosition());
  }

  public getSpiders() {
    return this.spiderWeapon.getSpiders();
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number) {
    const spriteManager = SpriteManager.getInstance();
    
    // Ensure deltaTime is a valid number
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
    
    // Get current animation frame
    const frame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);
    
    if (frame) {
      this.lastAnimationFrame = frame;
    }

    // Use assassin-specific sprites based on current animation (map to Player animation names)
    let spriteToUse = null;
    if (this.currentAnimation === "walk_up") {
      spriteToUse = spriteManager.getSprite("assassin_up");
    } else if (this.currentAnimation === "walk_down" || this.currentAnimation === "idle") {
      spriteToUse = spriteManager.getSprite("assassin_down");
    } else if (this.currentAnimation === "walk_sideways") {
      spriteToUse = spriteManager.getSprite("assassin_sideways");
    } else if (this.currentAnimation === "walk_diagonal") {
      spriteToUse = spriteManager.getSprite("assassin_diagonal_back");
    } else if (this.currentAnimation === "walk_diagonal_down") {
      spriteToUse = spriteManager.getSprite("assassin_diagonal_front");
    } else if (this.currentAnimation === "walk" || this.currentAnimation === "walk_forward") {
      spriteToUse = spriteManager.getSprite("assassin_down"); // Use down as default walking
    }

    // Fallback to down sprite if no specific sprite found
    if (!spriteToUse) {
      spriteToUse = spriteManager.getSprite("assassin_down");
    }

    if (spriteToUse) {
      // Store the current frame as last animation frame for idle use
      if (frame && this.currentAnimation !== "idle") {
        this.lastAnimationFrame = frame;
      }

      // Calculate proper draw dimensions based on animation to preserve aspect ratio
      let drawWidth = this.width;
      let drawHeight = this.height;

      // For assassin animations (800x450), maintain proper aspect ratio
      const aspectRatio = 800 / 450; // ~1.78
      drawWidth = this.height * aspectRatio; // Keep height, adjust width

      // Calculate draw position (center the sprite)
      const drawX = this.x - drawWidth / 2;
      const drawY = this.y - drawHeight / 2;

      // Handle sprite flipping based on movement direction (same logic as Player)
      const shouldFlip =
        (this.currentAnimation === "walk_diagonal" && this.lastMoveDirection.x > 0) ||
        (this.currentAnimation === "walk_diagonal_down" && this.lastMoveDirection.x < 0) ||
        (this.currentAnimation === "walk_sideways" && this.lastMoveDirection.x < 0) ||
        (this.currentAnimation !== "walk_diagonal" && this.currentAnimation !== "walk_sideways" && 
         this.currentAnimation !== "walk_down" && this.currentAnimation !== "walk_up" && 
         this.currentAnimation !== "walk_diagonal_down" && this.lastMoveDirection.x > 0);

      ctx.save();
      if (shouldFlip) {
        ctx.translate(this.x, this.y);
        ctx.scale(-1, 1);
        ctx.translate(-this.x, -this.y);
      }

      try {
        if (frame) {
          // Use animation frame
          ctx.drawImage(
            spriteToUse,
            frame.x, frame.y,
            frame.width, frame.height,
            drawX, drawY,
            drawWidth, drawHeight
          );
        } else {
          // Fallback - use full sprite (800x450)
          ctx.drawImage(
            spriteToUse,
            0, 0, 800, 450,
            drawX, drawY,
            drawWidth, drawHeight
          );
        }
      } catch (error) {
        console.error("Error drawing assassin sprite:", error);
        // Fallback: render a colored rectangle
        ctx.fillStyle = "#ff0000"; 
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
      }

      ctx.restore();
    } else {
      // Fallback: render a colored rectangle
      ctx.fillStyle = "#ff00ff"; 
      ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

    // Render health bar
    this.renderHealthBar(ctx);

    // Render spiders
    this.spiderWeapon.renderSpiders(ctx, 0, 0); // Camera offset will be handled by GameEngine
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D) {
    // Draw health bar if damaged
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;

      // Background
      ctx.fillStyle = "#333333";
      ctx.fillRect(
        this.x,
        this.y - 10,
        barWidth,
        barHeight
      );

      // Health
      ctx.fillStyle = "#44ff44";
      ctx.fillRect(
        this.x,
        this.y - 10,
        barWidth * healthPercent,
        barHeight
      );
    }
  }

  public fire(deltaTime: number, direction?: { x: number; y: number }): Projectile[] {
    // Assassin doesn't fire traditional projectiles, uses spiders instead
    return this.spiderWeapon.fire(deltaTime, this.x, this.y, direction);
  }
}
