
import { IGameObject, IRenderable, IUpdatable, IDestroyable } from './IGameObject';

export interface IEntity extends IGameObject, IRenderable, IUpdatable, IDestroyable {
  getPosition(): { x: number; y: number };
}

export interface IDamageable {
  takeDamage(amount: number): void;
  getHealth(): number;
  getMaxHealth(): number;
}

export interface IHealable {
  heal(amount: number): void;
}
