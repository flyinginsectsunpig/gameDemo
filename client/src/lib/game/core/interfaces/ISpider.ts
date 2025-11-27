
import { IGameObject, IRenderable, IUpdatable, IDestroyable } from './IGameObject';
import { IEnemy } from './IEnemy';

export interface ISpider extends IGameObject, IRenderable, IUpdatable, IDestroyable {
  update(deltaTime: number, enemies: IEnemy[], playerPos: { x: number; y: number }): void;
  isAttached: boolean;
  health: number;
  instanceId: string;
  currentAnimation: string;
  lastDirection: { x: number; y: number };
}
