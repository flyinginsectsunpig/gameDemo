import { GameObject } from "../entities/Player";
import { Projectile } from "../weapons/Projectile";
import { Enemy } from "../entities/enemies/Enemy";
import { ShieldedEnemy } from "../entities/enemies/ShieldedEnemy";
import { FlyingEnemy } from "../entities/enemies/FlyingEnemy";
import { EnemyProjectile } from "../entities/enemies/EnemyProjectile";

export class CollisionDetection {
  public checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    const obj1Width = (obj1 as any).collisionWidth || obj1.width;
    const obj1Height = (obj1 as any).collisionHeight || obj1.height;
    const obj2Width = (obj2 as any).collisionWidth || obj2.width;
    const obj2Height = (obj2 as any).collisionHeight || obj2.height;
    
    return (
      obj1.x - obj1Width / 2 < obj2.x + obj2Width / 2 &&
      obj1.x + obj1Width / 2 > obj2.x - obj2Width / 2 &&
      obj1.y - obj1Height / 2 < obj2.y + obj2Height / 2 &&
      obj1.y + obj1Height / 2 > obj2.y - obj2Height / 2
    );
  }

  public getDistance(obj1: GameObject, obj2: GameObject): number {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public checkTerrainCollision(obj: GameObject, terrainBounds?: { x: number; y: number; width: number; height: number }): boolean {
    if ((obj as any).ignoresTerrain) {
      return false;
    }
    
    if (!terrainBounds) {
      return false;
    }

    const objWidth = (obj as any).collisionWidth || obj.width;
    const objHeight = (obj as any).collisionHeight || obj.height;
    
    return (
      obj.x - objWidth / 2 < terrainBounds.x ||
      obj.x + objWidth / 2 > terrainBounds.x + terrainBounds.width ||
      obj.y - objHeight / 2 < terrainBounds.y ||
      obj.y + objHeight / 2 > terrainBounds.y + terrainBounds.height
    );
  }

  public canDamageEnemy(enemy: Enemy): boolean {
    // Use type checking with 'in' operator to avoid intersection issues
    if ('isShieldActive' in enemy && typeof (enemy as any).isShieldActive === 'function') {
      return !(enemy as any).isShieldActive();
    }
    return true;
  }

  public isFlying(obj: GameObject): boolean {
    return (obj as any).ignoresTerrain === true || obj instanceof FlyingEnemy;
  }

  public checkEnemyProjectilePlayerCollision(projectile: EnemyProjectile, player: GameObject): boolean {
    if (!projectile.isAlive()) return false;
    return this.checkCollision(projectile, player);
  }

  public static checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    const obj1Width = (obj1 as any).collisionWidth || obj1.width;
    const obj1Height = (obj1 as any).collisionHeight || obj1.height;
    const obj2Width = (obj2 as any).collisionWidth || obj2.width;
    const obj2Height = (obj2 as any).collisionHeight || obj2.height;
    
    return (
      obj1.x - obj1Width / 2 < obj2.x + obj2Width / 2 &&
      obj1.x + obj1Width / 2 > obj2.x - obj2Width / 2 &&
      obj1.y - obj1Height / 2 < obj2.y + obj2Height / 2 &&
      obj1.y + obj1Height / 2 > obj2.y - obj2Height / 2
    );
  }

  public static canDamageEnemy(enemy: Enemy): boolean {
    // Use type checking with 'in' operator to avoid intersection issues
    if ('isShieldActive' in enemy && typeof (enemy as any).isShieldActive === 'function') {
      return !(enemy as any).isShieldActive();
    }
    return true;
  }

  public static checkProjectileEnemyCollisions(projectiles: Projectile[], enemies: Enemy[]): { projectilesToRemove: number[], enemiesToRemove: number[], damageDealt: number } {
    const projectilesToRemove: number[] = [];
    const enemiesToRemove: number[] = [];
    let damageDealt = 0;

    for (let i = 0; i < projectiles.length; i++) {
      const projectile = projectiles[i];
      const isPiercing = (projectile as any).piercing;
      let hitCount = (projectile as any).hitCount || 0;
      const maxHits = (projectile as any).maxHits || 1;

      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];

        if (this.checkCollision(projectile, enemy)) {
          if (!this.canDamageEnemy(enemy)) {
            continue;
          }

          enemy.takeDamage(projectile.getDamage());
          damageDealt += projectile.getDamage();

          if (enemy.getHealth() <= 0 && !enemiesToRemove.includes(j)) {
            enemiesToRemove.push(j);
          }

          if (isPiercing) {
            hitCount++;
            (projectile as any).hitCount = hitCount;

            if (hitCount >= maxHits && !projectilesToRemove.includes(i)) {
              projectilesToRemove.push(i);
            }
          } else {
            if (!projectilesToRemove.includes(i)) {
              projectilesToRemove.push(i);
            }
            break;
          }
        }
      }
    }

    return { projectilesToRemove, enemiesToRemove, damageDealt };
  }
}
