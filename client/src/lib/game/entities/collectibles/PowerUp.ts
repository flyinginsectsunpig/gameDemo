
import { IPlayer } from "../../core/interfaces/IPlayer";

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  apply: (player: IPlayer) => void;
  characterRestriction?: "sylph" | "assassin";
}

export class PowerUp {
  constructor(
    public x: number,
    public y: number,
    public definition: PowerUpDefinition
  ) {}

  public apply(player: IPlayer): void {
    this.definition.apply(player);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.definition.color;
    ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    
    ctx.shadowColor = this.definition.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    ctx.shadowBlur = 0;
  }
}
