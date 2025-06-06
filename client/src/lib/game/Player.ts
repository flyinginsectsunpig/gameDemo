import { Weapon } from "./Weapon";
import { Projectile } from "./Projectile";
import { OrbitalWeapon } from "./OrbitalWeapon";
import { BaseWeapon, SingleShotWeapon } from "./WeaponTypes";
import { useGameState } from "../stores/useGameState";
import { SpriteManager } from "./SpriteManager";

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Player implements GameObject {
  public x: number;
  public y: number;
  public width = 40;
  public height = 40;
  public speed = 200;
  public weapon: BaseWeapon;
  private orbitalWeapons: OrbitalWeapon[] = [];
  private orbitalPositions: { x: number; y: number }[] = [];
  private lastMoveDirection = { x: 1, y: 0 }; // Default to right

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.weapon = new SingleShotWeapon();
  }

  public setWeapon(weapon: BaseWeapon) {
    this.weapon = weapon;
  }

  public update(deltaTime: number, input: any, canvasWidth: number, canvasHeight: number) {
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
    if (moveX !== 0 || moveY !== 0) {
      this.lastMoveDirection = { x: moveX, y: moveY };
    }

    // Apply movement
    this.x += moveX * this.speed * deltaTime;
    this.y += moveY * this.speed * deltaTime;

    // Keep player within bounds
    this.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(canvasHeight - this.height / 2, this.y));
  }

  public fireWeapon(deltaTime: number): Projectile[] {
    const projectiles = this.weapon.fire(deltaTime, this.x, this.y, this.lastMoveDirection);
    
    // Update orbital weapons and store their positions (no projectiles anymore)
    this.orbitalPositions = [];
    this.orbitalWeapons.forEach(orbital => {
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

  public upgradeHealth() {
    const gameState = useGameState.getState();
    gameState.upgradeHealth();
  }

  public render(ctx: CanvasRenderingContext2D) {
    const spriteManager = SpriteManager.getInstance();
    const playerSprite = spriteManager.getSprite('player');
    
    if (playerSprite) {
      // Draw player sprite
      ctx.drawImage(
        playerSprite,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback to blue square if sprite not loaded
      ctx.fillStyle = "#4488ff";
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );

      // Draw a white center dot
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        this.x - 2,
        this.y - 2,
        4,
        4
      );
    }

    // Render orbital weapons using stored positions
    this.orbitalWeapons.forEach((orbital, index) => {
      if (this.orbitalPositions[index]) {
        orbital.render(ctx, this.orbitalPositions[index].x, this.orbitalPositions[index].y);
      }
    });
  }
}
