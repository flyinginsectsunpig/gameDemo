
import { BaseEntity } from '../../core/base/BaseEntity';
import { IPlayer } from '../../core/interfaces/IPlayer';
import { IWeapon } from '../../core/interfaces/IWeapon';
import { IProjectile } from '../../core/interfaces/IProjectile';
import { SylphBloomsWeapon } from '../../weapons/implementations/SylphBloomsWeapon';
import { OrbitalWeapon } from '../../weapons/implementations/OrbitalWeapon';
import { SpriteManager } from '../../rendering/SpriteManager';
import { AnimationManager } from '../../rendering/AnimationManager';

export class Player extends BaseEntity implements IPlayer {
  public collisionWidth = 60;
  public collisionHeight = 70;
  protected speed = 200;
  protected health = 100;
  protected maxHealth = 100;
  protected weapon: IWeapon | null;
  protected orbitalWeapons: OrbitalWeapon[] = [];
  protected lastMoveDirection = { x: 1, y: 0 };
  protected isMoving = false;
  protected instanceId: string;
  protected animationManager: AnimationManager;
  protected currentAnimation = "idle";
  protected lastAnimationFrame: any = null;

  constructor(x: number, y: number) {
    super(x, y, 96, 96);
    this.weapon = new SylphBloomsWeapon();
    this.instanceId = `player_${Date.now()}_${Math.random()}`;
    this.animationManager = new AnimationManager();
    this.setupAnimations();
  }

  private setupAnimations(): void {
    const walkFrames = [
      { x: 0, y: 0, width: 450, height: 450 },
      { x: 450, y: 0, width: 450, height: 450 },
      { x: 900, y: 0, width: 450, height: 450 },
      { x: 1350, y: 0, width: 450, height: 450 },
    ];

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

    const createFrames = (frameWidth: number, count: number) => {
      const frames = [];
      for (let i = 0; i < count; i++) {
        frames.push({
          x: i * frameWidth,
          y: 0,
          width: frameWidth,
          height: 450,
        });
      }
      return frames;
    };

    this.animationManager.addAnimation("walk", walkFrames, 0.1, true);
    this.animationManager.addAnimation("walk_diagonal", walkDiagonalFrames, 0.05, true);
    this.animationManager.addAnimation("walk_forward", createFrames(800, 30), 0.05, true);
    this.animationManager.addAnimation("walk_sideways", createFrames(800, 30), 0.05, true);
    this.animationManager.addAnimation("walk_down", createFrames(800, 30), 0.05, true);
    this.animationManager.addAnimation("walk_diagonal_down", createFrames(800, 30), 0.05, true);
    this.animationManager.addAnimation("walk_up", createFrames(800, 30), 0.05, true);
    this.animationManager.addAnimation("idle", [createFrames(800, 30)[0]], 1, true);

    this.lastAnimationFrame = createFrames(800, 30)[0];
  }

  public update(deltaTime: number, input: any, canvasWidth: number, canvasHeight: number, tileRenderer?: any): void {
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

    this.updateAnimation();
    this.updatePosition(moveX, moveY, deltaTime, tileRenderer);
  }

  private updateAnimation(): void {
    let targetAnimation = "idle";
    
    if (this.isMoving) {
      const { x: moveX, y: moveY } = this.lastMoveDirection;
      
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

  private updatePosition(moveX: number, moveY: number, deltaTime: number, tileRenderer: any): void {
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

  public render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const spriteManager = SpriteManager.getInstance();
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016;
    const currentFrame = this.animationManager.update(validDeltaTime, this.instanceId, this.currentAnimation);

    if (currentFrame && this.currentAnimation !== "idle") {
      this.lastAnimationFrame = currentFrame;
    }

    const sprites = this.getSpritesForAnimation();
    const spriteToUse = sprites[this.currentAnimation] || sprites['default'];

    if (spriteToUse && currentFrame) {
      this.renderSprite(ctx, spriteToUse, currentFrame);
    } else {
      this.renderFallback(ctx);
    }

    this.orbitalWeapons.forEach(orbital => orbital.render(ctx));
  }

  private getSpritesForAnimation(): Record<string, any> {
    const spriteManager = SpriteManager.getInstance();
    return {
      'walk_diagonal': spriteManager.getSprite("player_diagonal"),
      'walk_diagonal_down': spriteManager.getSprite("player_diagonal_down"),
      'walk_forward': spriteManager.getSprite("player_forward"),
      'walk_sideways': spriteManager.getSprite("player_sideways"),
      'walk_down': spriteManager.getSprite("player_down"),
      'walk_up': spriteManager.getSprite("player_up"),
      'default': spriteManager.getSprite("player")
    };
  }

  private renderSprite(ctx: CanvasRenderingContext2D, sprite: any, frame: any): void {
    ctx.save();

    let drawWidth = this.width;
    let drawHeight = this.height;

    if (['walk_forward', 'walk_diagonal', 'walk_sideways', 'walk_down', 'walk_up', 'walk_diagonal_down', 'idle'].includes(this.currentAnimation)) {
      const aspectRatio = 800 / 450;
      drawWidth = this.height * aspectRatio;
    }

    const drawX = this.x - drawWidth / 2;
    const drawY = this.y - drawHeight / 2;

    const shouldFlip = this.shouldFlipSprite();
    if (shouldFlip) {
      ctx.translate(this.x, this.y);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, -this.y);
    }

    ctx.drawImage(sprite, frame.x, frame.y, frame.width, frame.height, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  private shouldFlipSprite(): boolean {
    return (
      (this.currentAnimation === "walk_diagonal" && this.lastMoveDirection.x > 0) ||
      (this.currentAnimation === "walk_diagonal_down" && this.lastMoveDirection.x < 0) ||
      (this.currentAnimation === "walk_sideways" && this.lastMoveDirection.x < 0) ||
      (!['walk_diagonal', 'walk_sideways', 'walk_down', 'walk_up', 'walk_diagonal_down'].includes(this.currentAnimation) && this.lastMoveDirection.x > 0)
    );
  }

  private renderFallback(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  public fireWeapon(deltaTime: number): IProjectile[] {
    if (!this.weapon) return [];

    const projectiles = this.weapon.fire(deltaTime, this.x, this.y, this.lastMoveDirection);

    this.orbitalWeapons.forEach(orbital => {
      orbital.update(deltaTime, this.x, this.y);
    });

    return projectiles;
  }

  public getWeapon(): IWeapon | null {
    return this.weapon;
  }

  public setWeapon(weapon: IWeapon): void {
    this.weapon = weapon;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public addOrbitalWeapon(): void {
    this.orbitalWeapons.push(new OrbitalWeapon());
  }

  public getOrbitalWeapons(): OrbitalWeapon[] {
    return this.orbitalWeapons;
  }
}
