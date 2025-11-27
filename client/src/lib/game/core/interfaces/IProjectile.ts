
import { IGameObject, IRenderable, IUpdatable, IDestroyable } from './IGameObject';

export interface IProjectile extends IGameObject, IRenderable, IUpdatable, IDestroyable {
  getDamage(): number;
  addHit(): boolean;
}
