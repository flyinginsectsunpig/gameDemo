export enum WeaponRarity {
  Common = "common",
  Rare = "rare",
  Legendary = "legendary"
}

export interface WeaponRarityConfig {
  rarity: WeaponRarity;
  color: string;
  glowColor: string;
  damageMultiplier: number;
  dropChance: number;
  displayName: string;
}

export const WEAPON_RARITY_CONFIGS: Record<WeaponRarity, WeaponRarityConfig> = {
  [WeaponRarity.Common]: {
    rarity: WeaponRarity.Common,
    color: "#FFFFFF",
    glowColor: "#CCCCCC",
    damageMultiplier: 1.0,
    dropChance: 0.70,
    displayName: "Common"
  },
  [WeaponRarity.Rare]: {
    rarity: WeaponRarity.Rare,
    color: "#4169E1",
    glowColor: "#6495ED",
    damageMultiplier: 1.25,
    dropChance: 0.25,
    displayName: "Rare"
  },
  [WeaponRarity.Legendary]: {
    rarity: WeaponRarity.Legendary,
    color: "#FFD700",
    glowColor: "#FFA500",
    damageMultiplier: 1.5,
    dropChance: 0.05,
    displayName: "Legendary"
  }
};

export function getRandomRarity(): WeaponRarity {
  const roll = Math.random();
  
  if (roll < WEAPON_RARITY_CONFIGS[WeaponRarity.Legendary].dropChance) {
    return WeaponRarity.Legendary;
  }
  
  if (roll < WEAPON_RARITY_CONFIGS[WeaponRarity.Legendary].dropChance + 
              WEAPON_RARITY_CONFIGS[WeaponRarity.Rare].dropChance) {
    return WeaponRarity.Rare;
  }
  
  return WeaponRarity.Common;
}

export function getRarityConfig(rarity: WeaponRarity): WeaponRarityConfig {
  return WEAPON_RARITY_CONFIGS[rarity];
}

export function getRarityColor(rarity: WeaponRarity): string {
  return WEAPON_RARITY_CONFIGS[rarity].color;
}

export function getRarityDisplayName(rarity: WeaponRarity): string {
  return WEAPON_RARITY_CONFIGS[rarity].displayName;
}
