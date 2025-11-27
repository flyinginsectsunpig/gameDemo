
import { Player } from "./Player";
import { IEnemy } from "../../core/interfaces/IEnemy";
import { IProjectile } from "../../core/interfaces/IProjectile";
import { MechanicalSpider } from "../MechanicalSpider";
import { SpriteManager } from "../../rendering/SpriteManager";
import { AnimationManager } from "../../rendering/AnimationManager";

export class AssassinPlayer extends Player {
  private followerSpider: MechanicalSpider | null = null;
  private spiderSpawned = false;
  private tileRenderer: any = null;
  private spiderMode: "normal" | "big" | "small" = "normal";

  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 250;
    this.maxHealth = 80;
    this.health = this.maxHealth;

    this.weapon = null;
    this.instanceId = `assassin_${Date.now()}_${Math.random()}`;
    this.spawnSpider();
  }

  public update(deltaTime: number, input: any, canvasWidth: number, canvasHeight: number, tileRenderer: any): void {
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    if (moveX !== 0 || moveY !== 0) {
      this.lastMoveDirection = { x: moveX, y: moveY };
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    const newX = this.x + moveX * this.speed * deltaTime;
    const newY = this.y + moveY * this.speed * deltaTime;

    if (tileRenderer && tileRenderer.isSolidAt) {
      if (!this.checkTileCollision(newX, this.y, tileRenderer)) {
        this.x = newX;
      }
      if (!this.checkTileCollision(this.x, newY, tileRenderer)) {
        this.y = newY;
      }
    } else {
      this.x = newX;
      this.y = newY;
    }

    this.updateAnimation();
  }

  private updateAnimation(): void {
    let targetAnimation = "idle";
    const { x: moveX, y: moveY } = this.lastMoveDirection;

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

    if (this.currentAnimation !== targetAnimation) {
      if (targetAnimation === "idle" && this.lastAnimationFrame) {
        this.animationManager.addAnimation("idle", [this.lastAnimationFrame], 1, true);
      }
      this.currentAnimation = targetAnimation;
      this.animationManager.startAnimation(targetAnimation, this.instanceId);
    }
  }

  private spawnSpider(): void {
    if (!this.spiderSpawned && !this.followerSpider) {
      const offsetX = -60;
      const offsetY = -20;

      this.followerSpider = new MechanicalSpider(this.x + offsetX, this.y + offsetY, this.spiderMode);
      this.spiderSpawned = true;
      
      if (this.tileRenderer) {
        this.registerSpiderWithTileRenderer();
      }
    }
  }

  private registerSpiderWithTileRenderer(): void {
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

  public setTileRenderer(tileRenderer: any): void {
    this.tileRenderer = tileRenderer;
    if (this.followerSpider) {
      this.registerSpiderWithTileRenderer();
    }
  }

  public updateSpiders(deltaTime: number, enemies: IEnemy[], playerPos: { x: number; y: number }): void {
    if (this.followerSpider) {
      this.followerSpider.update(deltaTime, enemies, { x: this.x, y: this.y });

      if (this.tileRenderer) {
        this.tileRenderer.updateSpider(
          this.followerSpider.instanceId || `mechanical_spider_${Date.now()}`,
          this.followerSpider.x,
          this.followerSpider.y,
          this.followerSpider.currentAnimation || 'spider_idle',
          this.followerSpider.lastDirection || { x: 0, y: 1 }
        );
      }
    } else if (this.followerSpider && !this.followerSpider.isAlive()) {
      this.followerSpider = null;
    }
  }

  public renderSpiders(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0): void {
    if (this.followerSpider) {
      this.followerSpider.render(ctx, deltaTime, cameraX, cameraY);
    }
  }

  public getSpiders(): MechanicalSpider[] {
    return this.followerSpider ? [this.followerSpider] : [];
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const spriteManager = SpriteManager.getInstance();
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;

    const frame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);

    if (frame) {
      this.lastAnimationFrame = frame;
    }

    const spriteToUse = this.getAssassinSprite(spriteManager);

    if (spriteToUse) {
      this.renderAssassinSprite(ctx, spriteToUse, frame);
    } else {
      this.renderFallback(ctx);
    }

    this.renderHealthBar(ctx);
  }

  private getAssassinSprite(spriteManager: SpriteManager): HTMLImageElement | null {
    const spriteMap: Record<string, string> = {
      "walk_up": "assassin_up",
      "walk_down": "assassin_down",
      "idle": "assassin_down",
      "walk_sideways": "assassin_sideways",
      "walk_diagonal": "assassin_diagonal_back",
      "walk_diagonal_down": "assassin_diagonal_front",
      "walk": "assassin_down",
      "walk_forward": "assassin_down"
    };

    const spriteName = spriteMap[this.currentAnimation] || "assassin_down";
    return spriteManager.getSprite(spriteName);
  }

  private renderAssassinSprite(ctx: CanvasRenderingContext2D, sprite: HTMLImageElement, frame: any): void {
    if (frame && this.currentAnimation !== "idle") {
      this.lastAnimationFrame = frame;
    }

    const aspectRatio = 800 / 450;
    const drawWidth = this.height * aspectRatio;
    const drawHeight = this.height;
    const drawX = this.x - drawWidth / 2;
    const drawY = this.y - drawHeight / 2;

    const processedSprite = this.removeWhiteOutline(sprite, frame);

    ctx.save();
    if (this.shouldFlipSprite()) {
      ctx.translate(this.x, this.y);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, -this.y);
    }

    try {
      if (frame) {
        ctx.drawImage(processedSprite, 0, 0, frame.width, frame.height, drawX, drawY, drawWidth, drawHeight);
      } else {
        ctx.drawImage(processedSprite, 0, 0, 800, 450, drawX, drawY, drawWidth, drawHeight);
      }
    } catch (error) {
      this.renderFallback(ctx);
    }

    ctx.restore();
  }

  private removeWhiteOutline(sprite: HTMLImageElement, frame: any): HTMLCanvasElement {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;

    if (frame) {
      tempCanvas.width = frame.width;
      tempCanvas.height = frame.height;

      tempCtx.drawImage(sprite, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          data[i + 3] = 0;
        }
      }

      tempCtx.putImageData(imageData, 0, 0);
    }

    return tempCanvas;
  }

  private shouldFlipSprite(): boolean {
    return (
      (this.currentAnimation === "walk_diagonal" && this.lastMoveDirection.x > 0) ||
      (this.currentAnimation === "walk_diagonal_down" && this.lastMoveDirection.x < 0) ||
      (this.currentAnimation === "walk_sideways" && this.lastMoveDirection.x < 0)
    );
  }

  private renderFallback(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;

      ctx.fillStyle = "#333333";
      ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);

      ctx.fillStyle = "#44ff44";
      ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
    }
  }

  private checkTileCollision(x: number, y: number, tileRenderer: any): boolean {
    const margin = 2;
    const points = [
      { x: x + margin, y: y + margin },
      { x: x + this.width - margin, y: y + margin },
      { x: x + margin, y: y + this.height - margin },
      { x: x + this.width - margin, y: y + this.height - margin }
    ];

    return points.some(point => tileRenderer.isSolidAt(point.x, point.y));
  }

  public fireWeapon(deltaTime: number): IProjectile[] {
    return [];
  }

  public getWeapon() {
    return null;
  }

  public setBigSpiderMode(enable: boolean): void {
    if (enable && this.spiderMode !== "big") {
      this.spiderMode = "big";
      this.respawnSpider();
    }
  }

  public setSmallSpidersMode(enable: boolean): void {
    if (enable && this.spiderMode !== "small") {
      this.spiderMode = "small";
      this.respawnSpider();
    }
  }

  private respawnSpider(): void {
    if (this.followerSpider) {
      this.followerSpider.destroy();
      this.followerSpider = null;
      this.spiderSpawned = false;
    }

    this.spawnSpider();
  }
}
