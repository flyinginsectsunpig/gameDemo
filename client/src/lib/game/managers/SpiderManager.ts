
import { ISpider } from "../core/interfaces/ISpider";
import { IEnemy } from "../core/interfaces/IEnemy";
import { MechanicalSpider } from "../entities/spiders/MechanicalSpider";

export class SpiderManager {
  private spiders: ISpider[] = [];
  private spiderMode: "normal" | "big" | "small" = "normal";
  private maxSpiders = 1;

  constructor(mode: "normal" | "big" | "small" = "normal") {
    this.spiderMode = mode;
  }

  public spawnSpider(x: number, y: number): void {
    if (this.spiders.length < this.maxSpiders) {
      const spider = new MechanicalSpider(x, y, this.spiderMode);
      this.spiders.push(spider);
    }
  }

  public update(deltaTime: number, enemies: IEnemy[], playerPos: { x: number; y: number }): void {
    // Remove dead spiders
    this.spiders = this.spiders.filter(spider => spider.isAlive());

    // Update alive spiders
    this.spiders.forEach(spider => {
      spider.update(deltaTime, enemies, playerPos);
    });
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0): void {
    this.spiders.forEach(spider => {
      spider.render(ctx, deltaTime, cameraX, cameraY);
    });
  }

  public getSpiders(): ISpider[] {
    return [...this.spiders];
  }

  public setMode(mode: "normal" | "big" | "small"): void {
    if (this.spiderMode !== mode) {
      this.spiderMode = mode;
      this.respawnAllSpiders();
    }
  }

  public upgradeMaxSpiders(): void {
    this.maxSpiders++;
  }

  private respawnAllSpiders(): void {
    this.spiders.forEach(spider => spider.destroy());
    this.spiders = [];
  }

  public destroy(): void {
    this.spiders.forEach(spider => spider.destroy());
    this.spiders = [];
  }
}
