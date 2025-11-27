
import { ICollectible } from "../core/interfaces/ICollectible";
import { ExperienceOrb } from "../entities/collectibles/ExperienceOrb";
import { PowerUp } from "../entities/collectibles/PowerUp";

export class CollectibleManager {
  private collectibles: ICollectible[] = [];

  public spawnExperienceOrb(x: number, y: number, value: number = 5): void {
    this.collectibles.push(new ExperienceOrb(x, y, value));
  }

  public spawnPowerUp(x: number, y: number, type: string = "health"): void {
    this.collectibles.push(new PowerUp(x, y, type));
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    // Remove expired collectibles
    this.collectibles = this.collectibles.filter(c => !c.isExpired());

    // Update remaining collectibles
    this.collectibles.forEach(collectible => {
      collectible.update(deltaTime, playerPos);
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.collectibles.forEach(collectible => {
      collectible.render(ctx);
    });
  }

  public checkCollections(playerPos: { x: number; y: number }): ICollectible[] {
    const collected: ICollectible[] = [];
    
    this.collectibles = this.collectibles.filter(collectible => {
      if (collectible.canBeCollected(playerPos)) {
        collected.push(collectible);
        return false;
      }
      return true;
    });

    return collected;
  }

  public getCollectibles(): ICollectible[] {
    return [...this.collectibles];
  }

  public clear(): void {
    this.collectibles = [];
  }
}
