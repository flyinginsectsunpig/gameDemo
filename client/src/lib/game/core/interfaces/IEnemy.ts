
import { IEntity, IDamageable } from './IEntity';

export interface IEnemy extends IEntity, IDamageable {
  getDamage(): number;
  getScoreValue(): number;
  getType(): string;
}
