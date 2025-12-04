
import { IWeapon, IUpgradeable } from "../core/interfaces/IWeapon";

export type WeaponRarity = "common" | "rare" | "epic" | "legendary";

export interface WeaponEvolution {
  baseWeapon: string;
  evolvedWeapon: string;
  requiredLevel: number;
  requiredItem?: string;
}

export interface WeaponRarityData {
  rarity: WeaponRarity;
  damageMultiplier: number;
  color: string;
  glowColor: string;
}

export const WEAPON_RARITIES: Record<WeaponRarity, WeaponRarityData> = {
  common: {
    rarity: "common",
    damageMultiplier: 1.0,
    color: "#ffffff",
    glowColor: "#cccccc"
  },
  rare: {
    rarity: "rare",
    damageMultiplier: 1.3,
    color: "#4287f5",
    glowColor: "#6ea3ff"
  },
  epic: {
    rarity: "epic",
    damageMultiplier: 1.6,
    color: "#9b59b6",
    glowColor: "#c792ea"
  },
  legendary: {
    rarity: "legendary",
    damageMultiplier: 2.0,
    color: "#f39c12",
    glowColor: "#ffd700"
  }
};

export const WEAPON_EVOLUTIONS: WeaponEvolution[] = [
  {
    baseWeapon: "sylph_blooms",
    evolvedWeapon: "divine_garden",
    requiredLevel: 8,
    requiredItem: "ancient_seed"
  },
  {
    baseWeapon: "orbital",
    evolvedWeapon: "celestial_rings",
    requiredLevel: 8,
    requiredItem: "star_fragment"
  },
  {
    baseWeapon: "thunder_strike",
    evolvedWeapon: "storm_caller",
    requiredLevel: 8,
    requiredItem: "storm_essence"
  },
  {
    baseWeapon: "poison_cloud",
    evolvedWeapon: "toxic_tempest",
    requiredLevel: 8,
    requiredItem: "venom_core"
  },
  {
    baseWeapon: "laser_beam",
    evolvedWeapon: "omega_beam",
    requiredLevel: 8,
    requiredItem: "energy_crystal"
  }
];

export class WeaponEvolutionSystem {
  private playerWeapons: Map<string, { weapon: IWeapon; level: number; rarity: WeaponRarity }> = new Map();
  private inventory: Set<string> = new Set();

  public addWeapon(weaponType: string, weapon: IWeapon, rarity: WeaponRarity = "common"): void {
    this.playerWeapons.set(weaponType, { weapon, level: 1, rarity });
  }

  public upgradeWeapon(weaponType: string): boolean {
    const weaponData = this.playerWeapons.get(weaponType);
    if (!weaponData) return false;

    weaponData.level++;

    // Check if weapon implements IUpgradeable
    if ('upgrade' in weaponData.weapon && typeof weaponData.weapon.upgrade === 'function') {
      (weaponData.weapon as unknown as IUpgradeable).upgrade();
    } else {
      // Fallback: try to upgrade damage directly
      if ('upgradeDamage' in weaponData.weapon && typeof weaponData.weapon.upgradeDamage === 'function') {
        (weaponData.weapon as any).upgradeDamage();
      }
    }

    const evolution = this.checkEvolution(weaponType, weaponData.level);
    if (evolution) {
      return true;
    }

    return false;
  }

  public addItem(item: string): void {
    this.inventory.add(item);
  }

  public hasItem(item: string): boolean {
    return this.inventory.has(item);
  }

  private checkEvolution(weaponType: string, level: number): WeaponEvolution | null {
    const evolution = WEAPON_EVOLUTIONS.find(
      e => e.baseWeapon === weaponType && level >= e.requiredLevel
    );

    if (evolution && (!evolution.requiredItem || this.hasItem(evolution.requiredItem))) {
      return evolution;
    }

    return null;
  }

  public getAvailableEvolutions(): WeaponEvolution[] {
    const available: WeaponEvolution[] = [];

    this.playerWeapons.forEach((data, weaponType) => {
      const evolution = this.checkEvolution(weaponType, data.level);
      if (evolution) {
        available.push(evolution);
      }
    });

    return available;
  }

  public applyRarityBonus(weapon: IWeapon, rarity: WeaponRarity): void {
    const rarityData = WEAPON_RARITIES[rarity];
    const newDamage = weapon.getDamage() * rarityData.damageMultiplier;

    // Try to set damage directly on BaseWeapon subclasses
    if ('damage' in weapon) {
      (weapon as any).damage = newDamage;
    }
  }

  public getWeaponData(weaponType: string) {
    return this.playerWeapons.get(weaponType);
  }
}
