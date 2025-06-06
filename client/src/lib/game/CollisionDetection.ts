import { GameObject } from "./Player";

export class CollisionDetection {
  public checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return (
      obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
      obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
      obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
      obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2
    );
  }

  public getDistance(obj1: GameObject, obj2: GameObject): number {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
