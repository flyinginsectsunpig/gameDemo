
import { IEntity, IDamageable, IHealable } from './IEntity';
import { IWeapon } from './IWeapon';
import { IProjectile } from './IProjectile';

export interface IPlayer extends IEntity, IDamageable, IHealable {
  getWeapon(): IWeapon | null;
  setWeapon(weapon: IWeapon): void;
  fireWeapon(deltaTime: number): IProjectile[];
  getSpeed(): number;
  setSpeed(speed: number): void;
  getMaxHealth(): number;
  setMaxHealth(maxHealth: number): void;
  addOrbitalWeapon(): void;
}
