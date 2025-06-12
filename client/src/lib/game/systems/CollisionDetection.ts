import { GameObject } from "../entities/Player";

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
          // Deal damage to enemy
          enemy.takeDamage(projectile.damage);
          damageDealt += projectile.damage;

          // Remove enemy if dead
          if (enemy.health <= 0 && !enemiesToRemove.includes(j)) {
            enemiesToRemove.push(j);
          }

          // Handle piercing logic
          if (isPiercing) {
            hitCount++;
            (projectile as any).hitCount = hitCount;

            // Remove piercing projectile if max hits reached
            if (hitCount >= maxHits && !projectilesToRemove.includes(i)) {
              projectilesToRemove.push(i);
            }
          } else {
            // Remove regular projectile
            if (!projectilesToRemove.includes(i)) {
              projectilesToRemove.push(i);
            }
            break; // Regular projectile stops after first hit
          }
        }
      }
    }

    return { projectilesToRemove, enemiesToRemove, damageDealt };
  }
}