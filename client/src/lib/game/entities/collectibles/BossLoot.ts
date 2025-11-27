
import { ExperienceOrb } from "./ExperienceOrb";

export type BossLootType = "legendary_item" | "rare_weapon" | "currency_bonus" | "power_up" | "evolution_item";

export interface BossLootDrop {
  type: BossLootType;
  itemId: string;
  name: string;
  rarity: "rare" | "epic" | "legendary";
  x: number;
  y: number;
  collected: boolean;
}

export class BossLoot {
  public x: number;
  public y: number;
  private type: BossLootType;
  private itemId: string;
  private name: string;
  private rarity: "rare" | "epic" | "legendary";
  private collected: boolean = false;
  private attractionRadius: number = 150;
  private attractionSpeed: number = 300;
  private glowIntensity: number = 0;

  constructor(x: number, y: number, type: BossLootType, itemId: string, name: string, rarity: "rare" | "epic" | "legendary") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.itemId = itemId;
    this.name = name;
    this.rarity = rarity;
  }

  public update(deltaTime: number, playerPos: { x: number; y: number }): void {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.attractionRadius) {
      const moveX = (dx / distance) * this.attractionSpeed * deltaTime;
      const moveY = (dy / distance) * this.attractionSpeed * deltaTime;
      this.x += moveX;
      this.y += moveY;
    }

    this.glowIntensity = Math.sin(Date.now() / 200) * 0.5 + 0.5;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const colors = {
      rare: "#4287f5",
      epic: "#9b59b6",
      legendary: "#f39c12"
    };

    const color = colors[this.rarity];

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 + this.glowIntensity * 10;

    // Draw outer glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 30);
    gradient.addColorStop(0, color + "80");
    gradient.addColorStop(1, color + "00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw item icon
    ctx.fillStyle = color;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const icons = {
      legendary_item: "⭐",
      rare_weapon: "⚔️",
      currency_bonus: "💰",
      power_up: "🔮",
      evolution_item: "✨"
    };
    
    ctx.fillText(icons[this.type], this.x, this.y);

    // Draw rarity indicator
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20 + this.glowIntensity * 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public canBeCollected(playerPos: { x: number; y: number }): boolean {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 30;
  }

  public collect(): void {
    this.collected = true;
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public getType(): BossLootType {
    return this.type;
  }

  public getItemId(): string {
    return this.itemId;
  }

  public getName(): string {
    return this.name;
  }

  public getRarity(): "rare" | "epic" | "legendary" {
    return this.rarity;
  }
}

export function generateBossLoot(bossX: number, bossY: number, bossType: string): BossLoot[] {
  const loot: BossLoot[] = [];
  
  // Always drop currency
  loot.push(new BossLoot(
    bossX + (Math.random() - 0.5) * 100,
    bossY + (Math.random() - 0.5) * 100,
    "currency_bonus",
    "boss_currency",
    "Boss Bounty",
    "legendary"
  ));

  // Chance for evolution item
  if (Math.random() < 0.4) {
    const evolutionItems = ["ancient_seed", "star_fragment", "storm_essence", "venom_core", "energy_crystal"];
    const item = evolutionItems[Math.floor(Math.random() * evolutionItems.length)];
    loot.push(new BossLoot(
      bossX + (Math.random() - 0.5) * 100,
      bossY + (Math.random() - 0.5) * 100,
      "evolution_item",
      item,
      item.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      "epic"
    ));
  }

  // Chance for legendary item
  if (Math.random() < 0.2) {
    loot.push(new BossLoot(
      bossX + (Math.random() - 0.5) * 100,
      bossY + (Math.random() - 0.5) * 100,
      "legendary_item",
      "legendary_artifact",
      "Legendary Artifact",
      "legendary"
    ));
  }

  return loot;
}
