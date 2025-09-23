
import { SylphBloomsWeapon } from "../weapons/SylphBloomsWeapon";
import { Player } from "./Player";
import { AssassinPlayer } from "./AssassinPlayer";

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  apply: (player: Player) => void;
  characterRestriction?: "sylph" | "assassin";
}

export const POWERUP_DEFINITIONS: PowerUpDefinition[] = [
  // Sylph-specific powerups
  {
    id: "damage",
    name: "Flower Power",
    description: "Your flowers deal more damage to enemies",
    color: "#ff6b6b",
    characterRestriction: "sylph",
    apply: (player: Player) => {
      if (player.weapon instanceof SylphBloomsWeapon) {
        player.weapon.upgradeDamage();
      }
    }
  },
  {
    id: "fire_rate",
    name: "Rapid Bloom",
    description: "Spawn flowers more frequently",
    color: "#4ecdc4",
    characterRestriction: "sylph",
    apply: (player: Player) => {
      if (player.weapon instanceof SylphBloomsWeapon) {
        player.weapon.upgradeFireRate();
      }
    }
  },
  {
    id: "flower_capacity",
    name: "Garden Growth",
    description: "Maintain more flowers at once",
    color: "#45b7d1",
    characterRestriction: "sylph",
    apply: (player: Player) => {
      if (player.weapon instanceof SylphBloomsWeapon) {
        player.weapon.upgradeFlowerCapacity();
      }
    }
  },
  {
    id: "flower_lifespan",
    name: "Eternal Bloom",
    description: "Flowers last longer before wilting",
    color: "#96ceb4",
    characterRestriction: "sylph",
    apply: (player: Player) => {
      if (player.weapon instanceof SylphBloomsWeapon) {
        player.weapon.upgradeFlowerLifespan();
      }
    }
  },
  // Assassin-specific powerups (mutually exclusive)
  {
    id: "big_spider",
    name: "Big Spider",
    description: "Replace spider with a powerful tank-killer (high single-target DPS)",
    color: "#8b0000",
    characterRestriction: "assassin",
    apply: (player: Player) => {
      if (player instanceof AssassinPlayer) {
        player.setBigSpiderMode(true);
      }
    }
  },
  {
    id: "small_spiders",
    name: "Small Spiders",
    description: "Replace spider with multiple fast swarm-killers (die faster but excel vs. hordes)",
    color: "#4169e1",
    characterRestriction: "assassin",
    apply: (player: Player) => {
      if (player instanceof AssassinPlayer) {
        player.setSmallSpidersMode(true);
      }
    }
  },
  // Universal powerups
  {
    id: "health",
    name: "Nature's Blessing",
    description: "Restore health and increase maximum health",
    color: "#feca57",
    apply: (player: Player) => {
      player.heal(20);
      player.maxHealth += 10;
    }
  },
  {
    id: "speed",
    name: "Wind Walker",
    description: "Move faster through the battlefield",
    color: "#ff9ff3",
    apply: (player: Player) => {
      player.speed += 30;
    }
  }
];

export class PowerUp {
  constructor(
    public x: number,
    public y: number,
    public definition: PowerUpDefinition
  ) {}

  public apply(player: Player) {
    this.definition.apply(player);
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.definition.color;
    ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    
    // Add glow effect
    ctx.shadowColor = this.definition.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    ctx.shadowBlur = 0;
  }
}
