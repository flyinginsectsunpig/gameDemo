
import { IPlayer } from "../../core/interfaces/IPlayer";
import { ICollectible } from "../../core/interfaces/ICollectible";

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  apply: (player: IPlayer) => void;
  characterRestriction?: "sylph" | "assassin";
}

export class PowerUp implements ICollectible {
  public width: number = 20;
  public height: number = 20;
  private collected: boolean = false;
  private lifetime: number = 0;
  private maxLifetime: number = 30000; // 30 seconds

  constructor(
    public x: number,
    public y: number,
    public definition: PowerUpDefinition
  ) {}

  public apply(player: IPlayer): void {
    this.definition.apply(player);
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    this.lifetime += deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, deltaTime: number, cameraX?: number, cameraY?: number): void {
    const renderX = this.x - (cameraX || 0);
    const renderY = this.y - (cameraY || 0);

    ctx.fillStyle = this.definition.color;
    ctx.fillRect(renderX - 10, renderY - 10, 20, 20);

    ctx.shadowColor = this.definition.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(renderX - 8, renderY - 8, 16, 16);
    ctx.shadowBlur = 0;

    // Add pulsing effect
    const pulse = Math.sin(this.lifetime * 0.01) * 0.2 + 0.8;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = this.definition.color;
    ctx.fillRect(renderX - 6, renderY - 6, 12, 12);
    ctx.globalAlpha = 1;
  }

  public canBeCollected(playerPos: { x: number; y: number }): boolean {
    if (this.collected || this.isExpired()) return false;

    const dx = this.x - playerPos.x;
    const dy = this.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 30; // Collection radius
  }

  public getValue(): number {
    return 1; // Power-ups have a value of 1 for collection counting
  }

  public isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
}
