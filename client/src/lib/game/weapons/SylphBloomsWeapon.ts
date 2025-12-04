import { Enemy } from "../entities/enemies/Enemy";
import { InfiniteTileRenderer } from "../rendering/InfiniteTileRenderer";
import { Particle } from "../rendering/Particle";
import { useGameState } from "../../stores/useGameState";

export class SylphBloomsWeapon {
  protected damage: number;
  protected fireRate: number;
  protected projectileSpeed: number;
  protected lastFireTime: number = 0;
  private flowerSpawnTimer: number = 0; // Accumulator for game time
  private flowerSpawnInterval: number = 8; // 8 seconds between flower spawns (in seconds, not ms)
  private maxFlowers: number = 4; // Maximum flowers on field
  private flowerLifespan: number = 15000; // 15 seconds lifespan
  private tileRenderer: InfiniteTileRenderer | null = null;

  constructor() {
    this.fireRate = 2;
    this.damage = 35;
    this.projectileSpeed = 150;
  }

  // SylphBloomsWeapon doesn't fire regular projectiles, only flower orbs
  public fire(
    deltaTime: number,
    playerX: number,
    playerY: number,
    direction?: { x: number; y: number },
  ): any[] {
    return []; // No regular projectiles
  }

  public setTileRenderer(tileRenderer: InfiniteTileRenderer): void {
    this.tileRenderer = tileRenderer;
  }

  update(
    deltaTime: number,
    enemies: Enemy[],
    playerX: number,
    playerY: number,
  ): void {
    if (!this.tileRenderer) return;

    // Always update flowers regardless of game state to prevent animation reset issues
    this.tileRenderer.updateFlowers(deltaTime);

    // Don't spawn new flowers when game is paused or leveling up
    const gameState = useGameState.getState();
    if (gameState.phase !== "playing") {
      // Still update orbs but don't spawn new flowers
      this.tileRenderer.updateOrbs(deltaTime, enemies, playerX, playerY);
      return;
    }

    // Accumulate game time for flower spawning
    this.flowerSpawnTimer += deltaTime;

    // Spawn new flowers periodically using game time instead of real time
    const currentFlowers = this.tileRenderer.getAllFlowers();
    if (
      this.flowerSpawnTimer >= this.flowerSpawnInterval &&
      currentFlowers.length < this.maxFlowers
    ) {
      this.spawnFlowerTurret(playerX, playerY);
      this.flowerSpawnTimer -= this.flowerSpawnInterval; // Subtract interval to maintain rhythm
    }

    // Check flower shooting
    const flowers = this.tileRenderer.getAllFlowers();
    flowers.forEach((flower) => {
      if (this.tileRenderer!.canFlowerShoot(flower)) {
        const tileSize = this.tileRenderer!.getTileSize();
        const flowerWorldX = flower.tileX * tileSize + Math.floor(tileSize / 2);
        const flowerWorldY = flower.tileY * tileSize + Math.floor(tileSize / 2);
        const nearestEnemy = this.findNearestEnemy(
          enemies,
          flowerWorldX,
          flowerWorldY,
          200,
        );
        if (nearestEnemy) {
          this.tileRenderer!.fireOrbFromFlower(flower, nearestEnemy, this.damage);
          this.tileRenderer!.flowerShoot(flower);
        }
      }
    });

    // Update orbs through tile renderer
    this.tileRenderer.updateOrbs(deltaTime, enemies, playerX, playerY);
  }

  private spawnFlowerTurret(playerX: number, playerY: number): void {
    if (!this.tileRenderer) return;

    const tileSize = this.tileRenderer.getTileSize();
    const playerTileX = Math.floor(playerX / tileSize);
    const playerTileY = Math.floor(playerY / tileSize);
    const maxTileRadius = 6;
    const minTileRadius = 3;

    const existingFlowers = this.tileRenderer.getAllFlowers();

    let foundPosition = false;
    let attempts = 0;
    let targetTileX = playerTileX;
    let targetTileY = playerTileY;

    while (!foundPosition && attempts < 50) {
      const angle = Math.random() * Math.PI * 2;
      const tileRadius =
        minTileRadius +
        Math.floor(Math.random() * (maxTileRadius - minTileRadius + 1));
      targetTileX = playerTileX + Math.round(Math.cos(angle) * tileRadius);
      targetTileY = playerTileY + Math.round(Math.sin(angle) * tileRadius);

      // Check if tile is already occupied
      const existingFlower = this.tileRenderer.getFlower(
        targetTileX,
        targetTileY,
      );
      if (!existingFlower) {
        // Check distance from other flowers
        let tooClose = false;
        for (const flower of existingFlowers) {
          const dx = flower.tileX - targetTileX;
          const dy = flower.tileY - targetTileY;
          const tileDistance = Math.sqrt(dx * dx + dy * dy);
          if (tileDistance < 2) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          foundPosition = true;
        }
      }
      attempts++;
    }

    // Fallback position if no good spot found
    if (!foundPosition) {
      const angle = Math.random() * Math.PI * 2;
      const tileRadius = 4;
      targetTileX = playerTileX + Math.round(Math.cos(angle) * tileRadius);
      targetTileY = playerTileY + Math.round(Math.sin(angle) * tileRadius);
    }

    const flower = this.tileRenderer.addFlower(
      targetTileX,
      targetTileY,
      this.flowerLifespan,
    );
    if (flower) {
      const worldX = targetTileX * tileSize;
      const worldY = targetTileY * tileSize;
      console.log(`Spawned flower:`);
      console.log(`  Tile coords: (${targetTileX}, ${targetTileY})`);
      console.log(`  World coords: (${worldX}, ${worldY})`);
      console.log(
        `  Player coords: (${playerX.toFixed(1)}, ${playerY.toFixed(1)})`,
      );
      console.log(`  Player tile: (${playerTileX}, ${playerTileY})`);
    }
  }

  private findNearestEnemy(
    enemies: Enemy[],
    x: number,
    y: number,
    maxRange: number,
  ): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDistance = maxRange;

    enemies.forEach((enemy) => {
      if (!enemy.isAlive()) return;

      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });

    return nearest;
  }



  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
  ): void {
    // Flowers and orbs are now rendered by the tile system
    // This method is kept for interface compatibility but does nothing
  }

  checkCollisions(enemies: Enemy[]): { enemy: any; damage: number; orbX: number; orbY: number }[] {
    // Delegate collision checking to tile renderer and return results
    if (this.tileRenderer) {
      return this.tileRenderer.checkOrbCollisions(enemies);
    }
    return [];
  }

  getParticles(): any[] {
    return this.tileRenderer ? this.tileRenderer.getAllOrbs() : [];
  }

  // Upgrade methods for power-ups
  public upgradeDamage() {
    this.damage += 5;
  }

  public upgradeFireRate() {
    // Reduce flower spawn interval and shot cooldown
    this.flowerSpawnInterval = Math.max(2, this.flowerSpawnInterval - 0.3); // In seconds now
    // Note: Individual flower shot cooldowns are handled by the tile renderer
  }

  public upgradeFlowerCapacity() {
    this.maxFlowers = Math.min(6, this.maxFlowers + 1);
  }

  public upgradeFlowerLifespan() {
    this.flowerLifespan += 3000; // +3 seconds
  }
}
