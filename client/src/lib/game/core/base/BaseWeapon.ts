
import { IWeapon } from '../interfaces/IWeapon';
import { IProjectile } from '../interfaces/IProjectile';

export abstract class BaseWeapon implements IWeapon {
  protected damage: number;
  protected fireRate: number;
  protected projectileSpeed: number;
  protected lastFireTime: number = 0;

  constructor(damage: number, fireRate: number, projectileSpeed: number) {
    this.damage = damage;
    this.fireRate = fireRate;
    this.projectileSpeed = projectileSpeed;
  }

  abstract fire(deltaTime: number, x: number, y: number, direction?: { x: number; y: number }): IProjectile[];

  public getDamage(): number {
    return this.damage;
  }

  public getFireRate(): number {
    return this.fireRate;
  }

  protected canFire(deltaTime: number): boolean {
    this.lastFireTime += deltaTime;
    if (this.lastFireTime >= 1 / this.fireRate) {
      this.lastFireTime = 0;
      return true;
    }
    return false;
  }
}
