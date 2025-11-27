
export type PassiveItemType = 
  | "armor" 
  | "speed_boots" 
  | "xp_magnet" 
  | "health_regen" 
  | "critical_chance"
  | "life_steal"
  | "damage_boost"
  | "cooldown_reduction";

export interface PassiveItemData {
  type: PassiveItemType;
  name: string;
  description: string;
  icon: string;
  maxStacks: number;
  effect: (player: any, stacks: number) => void;
}

export const PASSIVE_ITEMS: Record<PassiveItemType, PassiveItemData> = {
  armor: {
    type: "armor",
    name: "Iron Armor",
    description: "Reduces incoming damage by 10% per stack",
    icon: "🛡️",
    maxStacks: 5,
    effect: (player, stacks) => {
      player.damageReduction = Math.min(0.5, stacks * 0.1);
    }
  },
  speed_boots: {
    type: "speed_boots",
    name: "Swift Boots",
    description: "Increases movement speed by 15% per stack",
    icon: "👟",
    maxStacks: 3,
    effect: (player, stacks) => {
      player.speedMultiplier = 1 + (stacks * 0.15);
    }
  },
  xp_magnet: {
    type: "xp_magnet",
    name: "XP Magnet",
    description: "Increases XP pickup range by 50 per stack",
    icon: "🧲",
    maxStacks: 4,
    effect: (player, stacks) => {
      player.xpPickupRange = 100 + (stacks * 50);
    }
  },
  health_regen: {
    type: "health_regen",
    name: "Regeneration",
    description: "Regenerate 2 HP per second per stack",
    icon: "💚",
    maxStacks: 5,
    effect: (player, stacks) => {
      player.healthRegenRate = stacks * 2;
    }
  },
  critical_chance: {
    type: "critical_chance",
    name: "Critical Strike",
    description: "5% chance to deal double damage per stack",
    icon: "⚡",
    maxStacks: 4,
    effect: (player, stacks) => {
      player.criticalChance = Math.min(0.5, stacks * 0.05);
    }
  },
  life_steal: {
    type: "life_steal",
    name: "Life Steal",
    description: "Heal for 5% of damage dealt per stack",
    icon: "🩸",
    maxStacks: 3,
    effect: (player, stacks) => {
      player.lifeStealPercent = stacks * 0.05;
    }
  },
  damage_boost: {
    type: "damage_boost",
    name: "Power Surge",
    description: "Increases all damage by 20% per stack",
    icon: "💥",
    maxStacks: 5,
    effect: (player, stacks) => {
      player.damageMultiplier = 1 + (stacks * 0.2);
    }
  },
  cooldown_reduction: {
    type: "cooldown_reduction",
    name: "Haste",
    description: "Reduces all cooldowns by 10% per stack",
    icon: "⏰",
    maxStacks: 4,
    effect: (player, stacks) => {
      player.cooldownReduction = Math.min(0.4, stacks * 0.1);
    }
  }
};

export class PassiveItemManager {
  private items: Map<PassiveItemType, number> = new Map();

  public addItem(type: PassiveItemType): boolean {
    const itemData = PASSIVE_ITEMS[type];
    const currentStacks = this.items.get(type) || 0;

    if (currentStacks >= itemData.maxStacks) {
      return false;
    }

    this.items.set(type, currentStacks + 1);
    return true;
  }

  public getItemStacks(type: PassiveItemType): number {
    return this.items.get(type) || 0;
  }

  public applyEffects(player: any): void {
    this.items.forEach((stacks, type) => {
      const itemData = PASSIVE_ITEMS[type];
      itemData.effect(player, stacks);
    });
  }

  public getAllItems(): Array<{ type: PassiveItemType; stacks: number }> {
    const items: Array<{ type: PassiveItemType; stacks: number }> = [];
    this.items.forEach((stacks, type) => {
      items.push({ type, stacks });
    });
    return items;
  }
}
