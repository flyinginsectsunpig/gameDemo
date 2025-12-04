
import { ISpider } from "../core/interfaces/ISpider";
import { IEnemy } from "../core/interfaces/IEnemy";
import { MechanicalSpider } from "../entities/spiders/MechanicalSpider";
import { InfiniteTileRenderer } from "../rendering/InfiniteTileRenderer";

export class SpiderManager {
  private spiders: ISpider[] = [];
  private spiderMode: "normal" | "big" | "small" = "normal";
  private maxSpiders = 1;
  private tileRenderer: InfiniteTileRenderer | null = null;

  constructor(mode: "normal" | "big" | "small" = "normal") {
    this.spiderMode = mode;
    this.maxSpiders = mode === "small" ? 3 : 1; // Small mode can have multiple spiders
  }

  public spawnSpider(x: number, y: number): void {
    if (this.spiders.length < this.maxSpiders) {
      const spider = new MechanicalSpider(x, y, this.spiderMode);
      this.spiders.push(spider);
      this.registerSpiderWithTileRenderer(spider);
    }
  }

  public update(deltaTime: number, enemies: IEnemy[], playerPos: { x: number; y: number }): void {
    // Remove dead spiders and clean up tile renderer state
    this.spiders = this.spiders.filter(spider => {
      const alive = spider.isAlive();
      if (!alive) {
        this.tileRenderer?.removeSpider(spider.instanceId);
      }
      return alive;
    });

    // Update alive spiders
    this.spiders.forEach(spider => {
      spider.update(deltaTime, enemies, playerPos);
      this.updateTileRendererSpider(spider as MechanicalSpider);
    });
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX: number = 0, cameraY: number = 0): void {
    if (this.tileRenderer) {
      // Tile renderer handles drawing; nothing to do here.
      return;
    }

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

  public setTileRenderer(tileRenderer: InfiniteTileRenderer | null): void {
    this.tileRenderer = tileRenderer;
    if (this.tileRenderer) {
      this.spiders.forEach(spider => this.registerSpiderWithTileRenderer(spider as MechanicalSpider));
    }
  }

  private respawnAllSpiders(): void {
    this.spiders.forEach(spider => {
      this.tileRenderer?.removeSpider(spider.instanceId);
      spider.destroy();
    });
    this.spiders = [];
  }

  public destroy(): void {
    this.spiders.forEach(spider => {
      this.tileRenderer?.removeSpider(spider.instanceId);
      spider.destroy();
    });
    this.spiders = [];
  }

  private registerSpiderWithTileRenderer(spider: MechanicalSpider) {
    if (!this.tileRenderer) return;
    this.tileRenderer.addSpider(spider.getRenderState());
  }

  private updateTileRendererSpider(spider: MechanicalSpider) {
    if (!this.tileRenderer) return;
    this.tileRenderer.updateSpider(
      spider.instanceId,
      spider.x,
      spider.y,
      spider.currentAnimation,
      spider.lastDirection
    );
  }
}
