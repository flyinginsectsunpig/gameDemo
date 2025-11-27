
import { IGameObject, IRenderable, IUpdatable } from './IGameObject';

export interface ICollectible extends IGameObject, IRenderable, IUpdatable {
  canBeCollected(playerPos: { x: number; y: number }): boolean;
  getValue(): number;
  isExpired(): boolean;
}
