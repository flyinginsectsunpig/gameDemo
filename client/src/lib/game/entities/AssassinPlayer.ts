import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Projectile } from "../weapons/projectiles/Projectile";
import { MechanicalSpider } from "./MechanicalSpider";
import { SpriteManager } from "../rendering/SpriteManager";
import { AnimationManager } from "../rendering/AnimationManager";

// Global tracking for assassin players
let globalAssassinPlayerCount = 0;

export class AssassinPlayer extends Player {
  private followerSpider: MechanicalSpider | null = null;
  private spiderSpawned = false;
  private tileRenderer: any = null;
  private spiderMode: "normal" | "big" | "small" = "normal";

  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 250; // Faster than base player
    this.maxHealth = 80; // Less health than base player
    this.health = this.maxHealth;

    globalAssassinPlayerCount++;
    const instanceId = `assassin_${Date.now()}_${Math.random()}`;
    console.log(`Creating AssassinPlayer instance: ${instanceId}. Global count: ${globalAssassinPlayerCount}`);

    // Assassin doesn't use traditional weapons, so we keep the default weapon but override fireWeapon

    // Ensure instanceId is set for assassin
    this.instanceId = `assassin_${Date.now()}_${Math.random()}`;

    // Spawn spider immediately as a child
    this.spawnSpider();

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

    // Update last move direction if player is moving
    if (moveX !== 0 || moveY !== 0) {
      this.lastMoveDirection = { x: moveX, y: moveY };
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

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
  }

  private spawnSpider() {
    if (!this.spiderSpawned && !this.followerSpider) {
      // Spawn spider close to player
      const offsetX = -60;
      const offsetY = -20;

      this.followerSpider = new MechanicalSpider(this.x + offsetX, this.y + offsetY, this.spiderMode);
      this.spiderSpawned = true;
      console.log(`[${this.instanceId}] Spawned ${this.spiderMode} spider at (${this.x + offsetX}, ${this.y + offsetY})`);
      
      // Register with tile renderer if available
      if (this.tileRenderer) {
        this.registerSpiderWithTileRenderer();
      }
    }
  }

  private registerSpiderWithTileRenderer() {
    if (this.followerSpider && this.tileRenderer) {
      this.tileRenderer.addSpider({
        x: this.followerSpider.x,
        y: this.followerSpider.y,
        instanceId: this.followerSpider.instanceId || `mechanical_spider_${Date.now()}`,
        currentAnimation: this.followerSpider.currentAnimation || 'spider_idle',
        lastDirection: this.followerSpider.lastDirection || { x: 0, y: 1 }
      });
    }
  }

  public setTileRenderer(tileRenderer: any) {
    this.tileRenderer = tileRenderer;
    // Register spider if it exists
    if (this.followerSpider) {
      this.registerSpiderWithTileRenderer();
    }
  }

  public updateTileRenderer(tileRenderer: any) {
    // Register spider with tile renderer if it exists and isn't already registered
    if (this.followerSpider && tileRenderer) {
      // Add spider to tile renderer for proper background rendering
      tileRenderer.addSpider({
        x: this.followerSpider.x,
        y: this.followerSpider.y,
        instanceId: this.followerSpider.instanceId || `mechanical_spider_${Date.now()}`,
        currentAnimation: this.followerSpider.currentAnimation || 'spider_idle',
        lastDirection: this.followerSpider.lastDirection || { x: 0, y: 1 }
      });
    }
  }


  public updateSpiders(deltaTime: number, enemies: Enemy[], playerPos: { x: number; y: number }) {
    // Update child spider if it exists
    if (this.followerSpider) {
      this.followerSpider.update(deltaTime, enemies, { x: this.x, y: this.y });

      // Update tile renderer with spider position and animation state
      if (this.tileRenderer) {
        this.tileRenderer.updateSpider(
          this.followerSpider.instanceId || `mechanical_spider_${Date.now()}`,
          this.followerSpider.x,
          this.followerSpider.y,
          this.followerSpider.currentAnimation || 'spider_idle',
          this.followerSpider.lastDirection || { x: 0, y: 1 }
        );
      }
    }
    // Note: Spider cleanup is handled in the spider's own logic
  }

  public renderSpiders(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0) {
    if (this.followerSpider) {
      this.followerSpider.render(ctx, deltaTime, cameraX, cameraY);
    }
  }

  public getSpiders(): MechanicalSpider[] {
    return this.followerSpider ? [this.followerSpider] : [];
  }

  public getFollowerSpider(): MechanicalSpider | null {
    return this.followerSpider;
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

      // Create a temporary canvas to process the sprite and remove white outline
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;

      if (frame && spriteToUse) {
        tempCanvas.width = frame.width;
        tempCanvas.height = frame.height;

        // Draw the sprite frame to temp canvas
        tempCtx.drawImage(
          spriteToUse,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          0,
          0,
          frame.width,
          frame.height
        );

        // Remove white outline by making white pixels transparent
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is white or very close to white, make it transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        tempCtx.putImageData(imageData, 0, 0);
        spriteToUse = tempCanvas as any; // Use processed canvas as sprite
      }

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
            0, 0,
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

    // Note: Spiders should be rendered by GameEngine to prevent double rendering
    // this.spiderWeapon.renderSpiders(ctx, 0, 0);
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



  public fireWeapon(deltaTime: number): Projectile[] {
    // Override parent method to prevent flower weapon firing - assassin uses spiders instead
    return [];
  }

  public getWeapon() {
    // Return null to prevent flower weapon from being used
    return null;
  }

  public setBigSpiderMode(enable: boolean) {
    if (enable && this.spiderMode !== "big") {
      this.spiderMode = "big";
      this.respawnSpider();
      // Update game state
      import("../../stores/useGameState").then(({ useGameState }) => {
        useGameState.getState().setSpiderMode("big");
      });
    }
  }

  public setSmallSpidersMode(enable: boolean) {
    if (enable && this.spiderMode !== "small") {
      this.spiderMode = "small";
      this.respawnSpider();
      // Update game state
      import("../../stores/useGameState").then(({ useGameState }) => {
        useGameState.getState().setSpiderMode("small");
      });
    }
  }

  private respawnSpider() {
    // Remove existing spider
    if (this.followerSpider) {
      this.followerSpider.destroy();
      this.followerSpider = null;
      this.spiderSpawned = false;
    }

    // Spawn new spider with mode-specific stats
    this.spawnSpider();
  }
}
