
import { IProjectile } from './IProjectile';

export interface IWeapon {
  fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[];
  getDamage(): number;
  getFireRate(): number;
}

export interface IUpgradeable {
  upgrade(): void;
  getLevel(): number;
}
