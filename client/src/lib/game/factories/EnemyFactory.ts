import { IEnemy } from '../core/interfaces/IEnemy';
import { Enemy } from '../entities/enemies/Enemy';
import { FlyingEnemy } from '../entities/enemies/FlyingEnemy';
import { RangedEnemy } from '../entities/enemies/RangedEnemy';
import { TeleportingEnemy } from '../entities/enemies/TeleportingEnemy';
import { SplittingEnemy } from '../entities/enemies/SplittingEnemy';
import { ShieldedEnemy } from '../entities/enemies/ShieldedEnemy';

export type BasicEnemyType = 'basic' | 'fast' | 'tank';
export type SpecialEnemyType = 'flying' | 'ranged' | 'teleporting' | 'splitting' | 'shielded';
export type EnemyType = BasicEnemyType | SpecialEnemyType;

export interface SpawnWeight {
  type: EnemyType;
  weight: number;
  minWave: number;
}

export class EnemyFactory {
  private static readonly spawnWeights: SpawnWeight[] = [
    { type: 'basic', weight: 40, minWave: 1 },
    { type: 'fast', weight: 20, minWave: 2 },
    { type: 'tank', weight: 10, minWave: 3 },
    { type: 'flying', weight: 15, minWave: 2 },
    { type: 'ranged', weight: 12, minWave: 3 },
    { type: 'teleporting', weight: 8, minWave: 4 },
    { type: 'splitting', weight: 10, minWave: 4 },
    { type: 'shielded', weight: 8, minWave: 5 },
  ];

  public static createEnemy(type: EnemyType, x: number, y: number): IEnemy {
    switch (type) {
      case 'flying':
        return new FlyingEnemy(x, y);
      case 'ranged':
        return new RangedEnemy(x, y);
      case 'teleporting':
        return new TeleportingEnemy(x, y);
      case 'splitting':
        return new SplittingEnemy(x, y);
      case 'shielded':
        return new ShieldedEnemy(x, y);
      case 'basic':
      case 'fast':
      case 'tank':
        return new Enemy(x, y, type);
      default:
        return new Enemy(x, y, 'basic');
    }
  }

  public static createFlyingEnemy(x: number, y: number): FlyingEnemy {
    return new FlyingEnemy(x, y);
  }

  public static createRangedEnemy(x: number, y: number): RangedEnemy {
    return new RangedEnemy(x, y);
  }

  public static createTeleportingEnemy(x: number, y: number): TeleportingEnemy {
    return new TeleportingEnemy(x, y);
  }

  public static createSplittingEnemy(x: number, y: number, splitLevel: number = 0): SplittingEnemy {
    return new SplittingEnemy(x, y, splitLevel);
  }

  public static createShieldedEnemy(x: number, y: number): ShieldedEnemy {
    return new ShieldedEnemy(x, y);
  }

  public static createRandomEnemy(x: number, y: number, currentWave: number = 1): IEnemy {
    const availableTypes = this.spawnWeights.filter(sw => currentWave >= sw.minWave);
    
    const totalWeight = availableTypes.reduce((sum, sw) => sum + sw.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const spawnWeight of availableTypes) {
      random -= spawnWeight.weight;
      if (random <= 0) {
        return this.createEnemy(spawnWeight.type, x, y);
      }
    }
    
    return this.createEnemy('basic', x, y);
  }

  public static getAvailableTypesForWave(wave: number): EnemyType[] {
    return this.spawnWeights
      .filter(sw => wave >= sw.minWave)
      .map(sw => sw.type);
  }

  public static getSpawnChance(type: EnemyType, wave: number): number {
    const spawnWeight = this.spawnWeights.find(sw => sw.type === type);
    if (!spawnWeight || wave < spawnWeight.minWave) return 0;
    
    const availableTypes = this.spawnWeights.filter(sw => wave >= sw.minWave);
    const totalWeight = availableTypes.reduce((sum, sw) => sum + sw.weight, 0);
    
    return spawnWeight.weight / totalWeight;
  }
}
