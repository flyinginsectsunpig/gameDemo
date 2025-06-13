import { Enemy } from "../entities/Enemy";

export class WaveManager {
  private currentWave = 1;
  private enemiesSpawned = 0;
  private enemiesPerWave = 5;
  private spawnTimer = 0;
  private spawnInterval = 2; // seconds between spawns
  private waveStartTime = 0;
  private waveDuration = 30; // seconds per wave

  public update(deltaTime: number) {
    this.waveStartTime += deltaTime;
    this.spawnTimer += deltaTime;
  }

  public spawnEnemies(canvasWidth: number, canvasHeight: number): Enemy[] {
    const enemies: Enemy[] = [];

    // Check if we should advance to next wave
    if (this.waveStartTime >= this.waveDuration) {
      this.advanceWave();
    }

    // Spawn enemies based on timer
    if (this.spawnTimer >= this.spawnInterval && this.enemiesSpawned < this.getEnemiesForCurrentWave()) {
      const enemy = this.createRandomEnemy(canvasWidth, canvasHeight);
      enemies.push(enemy);
      this.enemiesSpawned++;
      this.spawnTimer = 0;
    }

    return enemies;
  }

  private advanceWave() {
    this.currentWave++;
    this.enemiesSpawned = 0;
    this.waveStartTime = 0;
    this.spawnInterval = Math.max(0.5, this.spawnInterval * 0.95); // Spawn faster each wave
    console.log(`Wave ${this.currentWave} started!`);
  }

  private getEnemiesForCurrentWave(): number {
    return this.enemiesPerWave + Math.floor(this.currentWave / 2);
  }

  private createRandomEnemy(canvasWidth: number, canvasHeight: number): Enemy {
    // Spawn from random edge
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    const margin = 50;

    switch (edge) {
      case 0: // top
        x = Math.random() * canvasWidth;
        y = -margin;
        break;
      case 1: // right
        x = canvasWidth + margin;
        y = Math.random() * canvasHeight;
        break;
      case 2: // bottom
        x = Math.random() * canvasWidth;
        y = canvasHeight + margin;
        break;
      case 3: // left
        x = -margin;
        y = Math.random() * canvasHeight;
        break;
      default:
        x = canvasWidth / 2;
        y = -margin;
    }

    // Determine enemy type based on wave
    let type: "basic" | "fast" | "tank" = "basic";
    const rand = Math.random();
    
    if (this.currentWave >= 3) {
      if (rand < 0.2) type = "fast";
      else if (rand < 0.1) type = "tank";
    } else if (this.currentWave >= 2) {
      if (rand < 0.15) type = "fast";
    }

    return new Enemy(x, y, type);
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public reset() {
    this.currentWave = 1;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.waveStartTime = 0;
    this.spawnInterval = 2;
  }
}
