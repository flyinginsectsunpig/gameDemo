
import { ICollidable } from '../core/interfaces/IGameObject';

export interface ICollisionService {
  checkCollision(obj1: ICollidable, obj2: ICollidable): boolean;
  getDistance(obj1: ICollidable, obj2: ICollidable): number;
}
