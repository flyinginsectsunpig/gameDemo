
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
    this.setupAssassinAnimations();
  }

  private setupAssassinAnimations() {
    // Clear existing animations and set up assassin-specific ones
    this.animationManager = new AnimationManager();
    
    // Assassin sprites are typically 32x32 frames in spritesheets
    const frameWidth = 32;
    const frameHeight = 32;
    const framesPerRow = 8; // Assuming 8 frames per animation row

    // Walking down animation
    const walkDownFrames = [];
    for (let i = 0; i < framesPerRow; i++) {
      walkDownFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      });
    }

    // Walking up animation
    const walkUpFrames = [];
    for (let i = 0; i < framesPerRow; i++) {
      walkUpFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      });
    }

    // Walking sideways animation
    const walkSidewaysFrames = [];
    for (let i = 0; i < framesPerRow; i++) {
      walkSidewaysFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      });
    }

    // Diagonal animations
    const walkDiagonalBackFrames = [];
    for (let i = 0; i < framesPerRow; i++) {
      walkDiagonalBackFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      });
    }

    const walkDiagonalFrontFrames = [];
    for (let i = 0; i < framesPerRow; i++) {
      walkDiagonalFrontFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      });
    }

    // Add animations to manager
    this.animationManager.addAnimation("walk_down", walkDownFrames, 0.1, true);
    this.animationManager.addAnimation("walk_up", walkUpFrames, 0.1, true);
    this.animationManager.addAnimation("walk_sideways", walkSidewaysFrames, 0.1, true);
    this.animationManager.addAnimation("walk_diagonal_back", walkDiagonalBackFrames, 0.1, true);
    this.animationManager.addAnimation("walk_diagonal_front", walkDiagonalFrontFrames, 0.1, true);
    this.animationManager.addAnimation("idle", [walkDownFrames[0]], 1, true);

    // Store the first frame as initial last frame
    this.lastAnimationFrame = walkDownFrames[0];
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

    // Determine animation based on movement
    let newAnimation = "idle";
    
    if (moveX !== 0 || moveY !== 0) {
      if (moveY < 0) { // Moving up
        if (moveX !== 0) {
          newAnimation = "walk_diagonal_back"; // Diagonal up
        } else {
          newAnimation = "walk_up";
        }
      } else if (moveY > 0) { // Moving down
        if (moveX !== 0) {
          newAnimation = "walk_diagonal_front"; // Diagonal down
        } else {
          newAnimation = "walk_down";
        }
      } else { // Moving horizontally
        newAnimation = "walk_sideways";
      }
    }

    // Update animation if it changed
    if (newAnimation !== this.currentAnimation) {
      this.currentAnimation = newAnimation;
      this.animationManager.startAnimation(newAnimation, this.id);
    }

    // Update spider weapon
    this.spiderWeapon.updateSpiders(deltaTime, [], this.getPosition());
  }

  public getSpiders() {
    return this.spiderWeapon.getSpiders();
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number) {
    const spriteManager = SpriteManager.getInstance();
    
    // Get current animation frame
    const frame = this.animationManager.update(deltaTime, this.id, this.currentAnimation);
    
    if (frame) {
      this.lastAnimationFrame = frame;
    }

    // Use assassin-specific sprites based on current animation
    let spriteToUse = null;
    if (this.currentAnimation === "walk_up") {
      spriteToUse = spriteManager.getSprite("assassin_up");
    } else if (this.currentAnimation === "walk_down" || this.currentAnimation === "idle") {
      spriteToUse = spriteManager.getSprite("assassin_down");
    } else if (this.currentAnimation === "walk_sideways") {
      spriteToUse = spriteManager.getSprite("assassin_sideways");
    } else if (this.currentAnimation === "walk_diagonal_back") {
      spriteToUse = spriteManager.getSprite("assassin_diagonal_back");
    } else if (this.currentAnimation === "walk_diagonal_front") {
      spriteToUse = spriteManager.getSprite("assassin_diagonal_front");
    }

    // Fallback to down sprite if no specific sprite found
    if (!spriteToUse) {
      spriteToUse = spriteManager.getSprite("assassin_down");
    }

    if (spriteToUse && this.lastAnimationFrame) {
      const renderWidth = this.width;
      const renderHeight = this.height;

      try {
        ctx.drawImage(
          spriteToUse,
          this.lastAnimationFrame.x,
          this.lastAnimationFrame.y,
          this.lastAnimationFrame.width,
          this.lastAnimationFrame.height,
          this.x,
          this.y,
          renderWidth,
          renderHeight
        );
      } catch (error) {
        console.error("Error drawing assassin sprite:", error);
        // Fallback: render a colored rectangle with assassin theme
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
      }
    } else {
      console.log("Sprite not found or no animation frame:", { 
        spriteToUse: !!spriteToUse, 
        lastAnimationFrame: !!this.lastAnimationFrame,
        currentAnimation: this.currentAnimation
      });
      // Fallback: render a colored rectangle with assassin theme
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "#8b0000";
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
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
