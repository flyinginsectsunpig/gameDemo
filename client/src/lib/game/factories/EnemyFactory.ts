
import { IEnemy } from '../core/interfaces/IEnemy';
import { Enemy } from '../entities/enemies/Enemy';

export type EnemyType = 'basic' | 'fast' | 'tank';

export class EnemyFactory {
  public static createEnemy(type: EnemyType, x: number, y: number): IEnemy {
    return new Enemy(x, y, type);
  }

  public static createRandomEnemy(x: number, y: number): IEnemy {
    const types: EnemyType[] = ['basic', 'fast', 'tank'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.createEnemy(randomType, x, y);
  }
}
