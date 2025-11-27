
import { ICollisionService } from './ICollisionService';
import { ICollidable } from '../core/interfaces/IGameObject';

export class CollisionService implements ICollisionService {
  public checkCollision(obj1: ICollidable, obj2: ICollidable): boolean {
    const obj1Width = obj1.collisionWidth || obj1.width;
    const obj1Height = obj1.collisionHeight || obj1.height;
    const obj2Width = obj2.collisionWidth || obj2.width;
    const obj2Height = obj2.collisionHeight || obj2.height;
    
    return (
      obj1.x - obj1Width / 2 < obj2.x + obj2Width / 2 &&
      obj1.x + obj1Width / 2 > obj2.x - obj2Width / 2 &&
      obj1.y - obj1Height / 2 < obj2.y + obj2Height / 2 &&
      obj1.y + obj1Height / 2 > obj2.y - obj2Height / 2
    );
  }

  public getDistance(obj1: ICollidable, obj2: ICollidable): number {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
