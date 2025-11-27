
import { IEntity } from '../interfaces/IEntity';

export abstract class BaseEntity implements IEntity {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  protected alive: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  abstract update(deltaTime: number, ...args: any[]): void;
  abstract render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX?: number, cameraY?: number): void;

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public destroy(): void {
    this.alive = false;
  }
}
