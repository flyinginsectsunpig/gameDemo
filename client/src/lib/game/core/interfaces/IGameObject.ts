
export interface IGameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICollidable extends IGameObject {
  collisionWidth?: number;
  collisionHeight?: number;
}

export interface IRenderable {
  render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX?: number, cameraY?: number): void;
}

export interface IUpdatable {
  update(deltaTime: number, ...args: any[]): void;
}

export interface IDestroyable {
  isAlive(): boolean;
  destroy(): void;
}
