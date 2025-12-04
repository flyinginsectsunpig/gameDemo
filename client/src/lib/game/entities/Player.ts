import { Projectile } from "../weapons/projectiles/Projectile";
import { OrbitalWeapon } from "../weapons/OrbitalWeapon";
import { BaseWeapon } from "../weapons/WeaponTypes";
import { Weapon } from "../weapons/Weapon";
import { useGameState } from "../../stores/useGameState";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";
import { IPlayer } from "../core/interfaces/IPlayer";
import { IWeapon } from "../core/interfaces/IWeapon";

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Player implements GameObject, IPlayer {
  public x: number;
  public y: number;
  public width = 96;
  public height = 96;
  public collisionWidth = 60; // Larger collision box for better collision detection
  public collisionHeight = 70; // Taller collision box for better vertical collision
  public speed = 200;
  public health = 100;
  public maxHealth = 100;
  private lastDamageTime = 0;
  private orbitalWeapons: OrbitalWeapon[] = [];
  private orbitalPositions: { x: number; y: number }[] = [];
  protected lastMoveDirection = { x: 1, y: 0 }; // Default to right
  protected isMoving = false;
  protected instanceId: string;
  protected animationManager: AnimationManager;
  protected currentAnimation = "idle";
  protected lastAnimationFrame: any = null;
  protected weapon: BaseWeapon;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.weapon = new Weapon();
    this.instanceId = `player_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();
  }

  private updateAnimationSpeed(animationName: string, frameDuration: number) {
    // Get the current animation frames
    const currentFrames = this.getCurrentAnimationFrames(animationName);
    if (currentFrames) {
      this.animationManager.addAnimation(animationName, currentFrames, frameDuration, true);
    }
  }

  private getCurrentAnimationFrames(animationName: string) {
    switch (animationName) {
      case "walk":
        return [
          { x: 0, y: 0, width: 450, height: 450 },
          { x: 450, y: 0, width: 450, height: 450 },
          { x: 900, y: 0, width: 450, height: 450 },
          { x: 1350, y: 0, width: 450, height: 450 },
        ];
      case "walk_diagonal":
        const frameWidth = 24000 / 30;
        const walkDiagonalFrames = [];
        for (let i = 0; i < 30; i++) {
          walkDiagonalFrames.push({
            x: i * frameWidth,
            y: 0,
            width: frameWidth,
            height: 450,
          });
        }
        return walkDiagonalFrames;
      case "walk_forward":
        const walkForwardFrames = [];
        const forwardFrameWidth = 800;
        for (let i = 0; i < 30; i++) {
          walkForwardFrames.push({
            x: i * forwardFrameWidth,
            y: 0,
            width: forwardFrameWidth,
            height: 450,
          });
        }
        return walkForwardFrames;
      case "walk_sideways":
        const walkSidewaysFrames = [];
        const sidewaysFrameWidth = 800;
        for (let i = 0; i < 30; i++) {
          walkSidewaysFrames.push({
            x: i * sidewaysFrameWidth,
            y: 0,
            width: sidewaysFrameWidth,
            height: 450,
          });
        }
        return walkSidewaysFrames;
      case "walk_down":
        const walkDownFrames = [];
        const downFrameWidth = 800;
        for (let i = 0; i < 30; i++) {
          walkDownFrames.push({
            x: i * downFrameWidth,
            y: 0,
            width: downFrameWidth,
            height: 450,
          });
        }
        return walkDownFrames;
      case "walk_diagonal_down":
        const walkDiagonalDownFrames = [];
        const diagonalDownFrameWidth = 800;
        for (let i = 0; i < 30; i++) {
          walkDiagonalDownFrames.push({
            x: i * diagonalDownFrameWidth,
            y: 0,
            width: diagonalDownFrameWidth,
            height: 450,
          });
        }
        return walkDiagonalDownFrames;
      case "walk_up":
        const walkUpFrames = [];
        const upFrameWidth = 800;
        for (let i = 0; i < 30; i++) {
          walkUpFrames.push({
            x: i * upFrameWidth,
            y: 0,
            width: upFrameWidth,
            height: 450,
          });
        }
        return walkUpFrames;
      default:
        return null;
    }
  }

  private setupAnimations() {
    // Regular walking animation (4 frames, each 450x450 in a 1800x450 spritesheet)
    const walkFrames = [
      { x: 0, y: 0, width: 450, height: 450 },
      { x: 450, y: 0, width: 450, height: 450 },
      { x: 900, y: 0, width: 450, height: 450 },
      { x: 1350, y: 0, width: 450, height: 450 },
    ];

    // Diagonal walking animation (36 frames, each ~667x450 in a 24000x450 spritesheet)
    const frameWidth = 24000 / 30; // 666.67 pixels per frame
    const walkDiagonalFrames = [];
    for (let i = 0; i < 30; i++) {
      walkDiagonalFrames.push({
        x: i * frameWidth,
        y: 0,
        width: frameWidth,
        height: 450,
      });
    }

    // Forward walking animation (30 frames, each 800x450 in a 24000x450 spritesheet)
    const walkForwardFrames = [];
    const forwardFrameWidth = 800; // Each frame is 800px wide (24000 / 30 = 800)
    const forwardFrameCount = 30; // 30 frames total
    for (let i = 0; i < forwardFrameCount; i++) {
      walkForwardFrames.push({
        x: i * forwardFrameWidth,
        y: 0,
        width: forwardFrameWidth,
        height: 450,
      });
    }

    // Sideways walking animation - assuming similar structure to forward (will need need adjustment based on actual sprite dimensions)
    const walkSidewaysFrames = [];
    const sidewaysFrameWidth = 800; // Adjust based on your sideways sprite sheet dimensions
    const sidewaysFrameCount = 30; // Adjust based on your sideways sprite sheet frame count
    for (let i = 0; i < sidewaysFrameCount; i++) {
      walkSidewaysFrames.push({
        x: i * sidewaysFrameWidth,
        y: 0,
        width: sidewaysFrameWidth,
        height: 450, // Adjust based on your sideways sprite sheet height
      });
    }

    // Downward walking animation - assuming similar structure to forward
    const walkDownFrames = [];
    const downFrameWidth = 800; // Adjust based on your down sprite sheet dimensions
    const downFrameCount = 30; // Adjust based on your down sprite sheet frame count
    for (let i = 0; i < downFrameCount; i++) {
      walkDownFrames.push({
        x: i * downFrameWidth,
        y: 0,
        width: downFrameWidth,
        height: 450, // Adjust based on your down sprite sheet height
      });
    }

    // Diagonal down walking animation - similar structure to diagonal up
    const walkDiagonalDownFrames = [];
    const diagonalDownFrameWidth = 800; // Adjust based on your diagonal down sprite sheet dimensions
    const diagonalDownFrameCount = 30; // Adjust based on your diagonal down sprite sheet frame count
    for (let i = 0; i < diagonalDownFrameCount; i++) {
      walkDiagonalDownFrames.push({
        x: i * diagonalDownFrameWidth,
        y: 0,
        width: diagonalDownFrameWidth,
        height: 450, // Adjust based on your diagonal down sprite sheet height
      });
    }

    // Upward walking animation
    const walkUpFrames = [];
    const upFrameWidth = 800;
    const upFrameCount = 30;
    for (let i = 0; i < upFrameCount; i++) {
      walkUpFrames.push({
        x: i * upFrameWidth,
        y: 0,
        width: upFrameWidth,
        height: 450,
      });
    }

    this.animationManager.addAnimation("walk", walkFrames, 0.1, true);
    this.animationManager.addAnimation(
      "walk_diagonal",
      walkDiagonalFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation(
      "walk_forward",
      walkForwardFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation(
      "walk_sideways",
      walkSidewaysFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation(
      "walk_down",
      walkDownFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation(
      "walk_diagonal_down",
      walkDiagonalDownFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation(
      "walk_up",
      walkUpFrames,
      0.05,
      true,
    );
    this.animationManager.addAnimation("idle", [walkDownFrames[0]], 1, true);

    // Store the first frame of walking down as initial last frame
    this.lastAnimationFrame = walkDownFrames[0];
  }

  public getWeapon(): IWeapon | null {
    return this.weapon;
  }

  public update(
    deltaTime: number,
    input: any,
    canvasWidth: number,
    canvasHeight: number,
    tileRenderer?: any
  ) {
    // Handle movement
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/sqrt(2)
      moveY *= 0.707;
    }

    // Update last move direction if player is moving
    const wasMoving = this.isMoving;
    if (moveX !== 0 || moveY !== 0) {
      this.lastMoveDirection = { x: moveX, y: moveY };
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    // Determine which animation to use based on movement
    let targetAnimation = "idle";
    if (this.isMoving) {
      // Check if moving diagonally up (either direction)
      if (moveY < 0 && Math.abs(moveX) > 0) {
        targetAnimation = "walk_diagonal";
      } else if (moveY > 0 && Math.abs(moveX) > 0) {
        // Moving diagonally down - use diagonal down animation
        targetAnimation = "walk_diagonal_down";
      } else if (moveY > 0) {
        // Moving straight down - use down animation
        targetAnimation = "walk_down";
      } else if (moveY < 0 && Math.abs(moveX) === 0) {
        // Moving straight up - use up animation
        targetAnimation = "walk_up";
      } else if (Math.abs(moveX) > 0 && moveY === 0) {
        // Pure horizontal movement - use sideways animation
        targetAnimation = "walk_sideways";
      } else {
        // For other movements, use regular walk animation
        targetAnimation = "walk";
      }
    }

    // Use fixed frame duration for consistent animation timing
    const baseFrameDuration = 0.1; // Slower, more visible animation timing

    // Only log when animation changes, not every frame
    // Debug logging removed to reduce console spam

    // Switch animation if needed or update frame rate
    if (this.currentAnimation !== targetAnimation) {
      console.log(`Switching animation from ${this.currentAnimation} to ${targetAnimation}`);

      // If switching to idle, update idle animation with last frame
      if (targetAnimation === "idle" && this.lastAnimationFrame) {
        this.animationManager.addAnimation("idle", [this.lastAnimationFrame], 1, true);
      }

      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
    }

    // Don't update animation speed dynamically to avoid interference

    // Calculate new position
    const newX = this.x + moveX * this.speed * deltaTime;
    const newY = this.y + moveY * this.speed * deltaTime;

    // Check tile collisions if tileRenderer is available
    if (tileRenderer && tileRenderer.isSolidAt) {
      // Check horizontal movement
      if (!this.checkTileCollision(newX, this.y, tileRenderer)) {
        this.x = newX;
      }
      // Check vertical movement
      if (!this.checkTileCollision(this.x, newY, tileRenderer)) {
        this.y = newY;
      }
    } else {
      // Fallback: no tile collision, just update position
      this.x = newX;
      this.y = newY;
    }
  }

  public fireWeapon(deltaTime: number): Projectile[] {
    // Always use the last movement direction, even when idle
    const fireDirection = this.lastMoveDirection;

    const projectiles = this.weapon.fire(
      deltaTime,
      this.x,
      this.y,
      fireDirection,
    );

    // Debug logging when projectiles are created
    if (projectiles.length > 0) {
      console.log(`Fired ${projectiles.length} projectiles from ${this.weapon.constructor.name} in direction:`, fireDirection);
      console.log(`First projectile velocity: vx=${projectiles[0].vx}, vy=${projectiles[0].vy}`);
    }

    // Update orbital weapons and store their positions (no projectiles anymore)
    this.orbitalPositions = [];
    this.orbitalWeapons.forEach((orbital) => {
      const result = orbital.update(deltaTime, this.x, this.y);
      this.orbitalPositions.push({ x: result.x, y: result.y });
    });

    return projectiles;
  }

  public getOrbitalWeapons(): OrbitalWeapon[] {
    return this.orbitalWeapons;
  }

  public getPosition() {
    return { x: this.x, y: this.y };
  }

  public addOrbitalWeapon() {
    this.orbitalWeapons.push(new OrbitalWeapon());
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    // Ensure current health doesn't exceed new max
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getHealth(): number {
    return this.health;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public destroy(): void {
    // Cleanup logic if needed
  }

  public upgradeHealth() {
    const gameState = useGameState.getState();
    gameState.upgradeHealth();
  }

  public setWeapon(weapon: IWeapon) {
    this.weapon = weapon as any;
  }

  public renderFlowers(ctx: CanvasRenderingContext2D) {
    // Flowers are now rendered by the tile system, not directly by weapons
    // This method is kept for interface compatibility but does nothing
  }

  public setTileRenderer(tileRenderer: any): void {
    // Base Player class doesn't need tile renderer integration
    // This method exists for compatibility with GameEngine
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    this.lastDamageTime = Date.now();
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  protected checkTileCollision(x: number, y: number, tileRenderer: any): boolean {
    // Check collision points around the player
    const margin = 2; // Small margin to prevent getting stuck
    const points = [
      { x: x + margin, y: y + margin }, // Top-left
      { x: x + this.width - margin, y: y + margin }, // Top-right
      { x: x + margin, y: y + this.height - margin }, // Bottom-left
      { x: x + this.width - margin, y: y + this.height - margin } // Bottom-right
    ];

    return points.some(point => tileRenderer.isSolidAt(point.x, point.y));
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number) {
    const spriteManager = SpriteManager.getInstance();
    const playerSprite = spriteManager.getSprite("player");
    const playerDiagonalSprite = spriteManager.getSprite("player_diagonal");
    const playerForwardSprite = spriteManager.getSprite("player_forward");
    const playerSidewaysSprite = spriteManager.getSprite("player_sideways");
    const playerDownSprite = spriteManager.getSprite("player_down");
    const playerDiagonalDownSprite = spriteManager.getSprite("player_diagonal_down");
    const playerUpSprite = spriteManager.getSprite("player_up");

    // Debug logging
    if (!playerSprite) {
      console.warn("Player sprite not found - showing fallback square");
    }
    if (this.currentAnimation === "walk_diagonal" && !playerDiagonalSprite) {
      console.warn("Player diagonal sprite not found - using regular sprite");
    }
    if (this.currentAnimation === "walk_forward" && !playerForwardSprite) {
      console.warn("Player forward sprite not found - using regular sprite");
    }
    if (this.currentAnimation === "walk_sideways" && !playerSidewaysSprite) {
      console.warn("Player sideways sprite not found - using regular sprite");
    }
    if (this.currentAnimation === "walk_down" && !playerDownSprite) {
      console.warn("Player down sprite not found - using regular sprite");
    }
    if (this.currentAnimation === "walk_diagonal_down" && !playerDiagonalDownSprite) {
      console.warn("Player diagonal down sprite not found - using regular sprite");
    }
    if (this.currentAnimation === "walk_up" && !playerUpSprite) {
      console.warn("Player up sprite not found - using regular sprite");
    }

    if (playerSprite) {
      // Update and get current animation frame
      // Ensure deltaTime is a valid number
      const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
      const currentFrame = this.animationManager.update(
        validDeltaTime,
        this.instanceId,
        this.currentAnimation,
      );

      // Store the current frame as last animation frame for idle use
      if (currentFrame && this.currentAnimation !== "idle") {
        this.lastAnimationFrame = currentFrame;
      }

      // Draw animated sprite using current frame, with fallback
      ctx.save();

      // Calculate proper draw dimensions based on animation to preserve aspect ratio
      let drawWidth = this.width;
      let drawHeight = this.height;

      // For forward, diagonal, sideways, down, up, diagonal down, and idle animations (800x450), maintain proper aspect ratio
      if (this.currentAnimation === "walk_forward" || this.currentAnimation === "walk_diagonal" || this.currentAnimation === "walk_sideways" || this.currentAnimation === "walk_down" || this.currentAnimation === "walk_up" || this.currentAnimation === "walk_diagonal_down" || this.currentAnimation === "idle") {
        const aspectRatio = 800 / 450; // ~1.78
        drawWidth = this.height * aspectRatio; // Keep height, adjust width
      }

      // Calculate draw position
      const drawX = this.x - drawWidth / 2;
      const drawY = this.y - drawHeight / 2;

      // Handle sprite flipping based on movement direction
      // For diagonal animations: sprite shows up-left by default, flip for up-right
      // For diagonal down animations: sprite shows down-right by default, flip for down-left
      // For sideways animations: flip when moving left (sprite faces right by default)
      // For other movements: sprite faces left by default, flip for right movement
      const shouldFlip =
        (this.currentAnimation === "walk_diagonal" &&
          this.lastMoveDirection.x > 0) ||
        (this.currentAnimation === "walk_diagonal_down" &&
          this.lastMoveDirection.x < 0) ||
        (this.currentAnimation === "walk_sideways" &&
          this.lastMoveDirection.x < 0) ||
        (this.currentAnimation !== "walk_diagonal" && this.currentAnimation !== "walk_sideways" && this.currentAnimation !== "walk_down" && this.currentAnimation !== "walk_up" && this.currentAnimation !== "walk_diagonal_down" &&
          this.lastMoveDirection.x > 0);

      if (shouldFlip) {
        ctx.translate(this.x, this.y);
        ctx.scale(-1, 1);
        ctx.translate(-this.x, -this.y);
      }

      // Use appropriate spritesheet based on animation
      let spriteToUse = playerSprite;
      if (this.currentAnimation === "walk_diagonal" && playerDiagonalSprite) {
        spriteToUse = playerDiagonalSprite;
      } else if (this.currentAnimation === "walk_diagonal_down" && playerDiagonalDownSprite) {
        spriteToUse = playerDiagonalDownSprite;
      } else if (
        this.currentAnimation === "walk_forward" &&
        playerForwardSprite
      ) {
        spriteToUse = playerForwardSprite;
      } else if (
        this.currentAnimation === "walk_sideways" &&
        playerSidewaysSprite
      ) {
        spriteToUse = playerSidewaysSprite;
      } else if (
        this.currentAnimation === "walk_down" &&
        playerDownSprite
      ) {
        spriteToUse = playerDownSprite;
      } else if (
        this.currentAnimation === "walk_up" &&
        playerUpSprite
      ) {
        spriteToUse = playerUpSprite;
      }

      if (currentFrame) {
        // Use animation frame
        ctx.drawImage(
          spriteToUse,
          currentFrame.x,
          currentFrame.y,
          currentFrame.width,
          currentFrame.height,
          drawX,
          drawY,
          drawWidth,
          drawHeight,
        );
      } else {
        // Fallback - use first frame manually
        ctx.drawImage(
          spriteToUse,
          0,
          0,
          450,
          450, // First frame coordinates (450x450)
          drawX,
          drawY,
          drawWidth,
          drawHeight,
        );
      }

      ctx.restore();
    } else {
      // Fallback to colored square (this should not show if sprite loads)
      ctx.fillStyle = "#4444ff";
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
      );
    }

    // Render orbital weapons
    this.orbitalWeapons.forEach((orbital) => {
      orbital.render(ctx, this.x, this.y);
    });
  }
}
