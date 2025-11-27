
export interface WeaponSynergy {
  weapons: string[];
  name: string;
  description: string;
  bonus: {
    damageMultiplier?: number;
    cooldownReduction?: number;
    rangeIncrease?: number;
    specialEffect?: string;
  };
}

export const WEAPON_SYNERGIES: WeaponSynergy[] = [
  {
    weapons: ["thunder_strike", "poison_cloud"],
    name: "Toxic Storm",
    description: "Lightning electrifies poison clouds",
    bonus: {
      damageMultiplier: 1.3,
      specialEffect: "electrified_poison"
    }
  },
  {
    weapons: ["ice_nova", "laser_beam"],
    name: "Frozen Prism",
    description: "Lasers shatter frozen enemies",
    bonus: {
      damageMultiplier: 1.5,
      specialEffect: "shatter_frozen"
    }
  },
  {
    weapons: ["orbital", "boomerang"],
    name: "Orbital Dance",
    description: "Rotating weapons move faster",
    bonus: {
      cooldownReduction: 0.2,
      rangeIncrease: 1.2
    }
  },
  {
    weapons: ["sylph_blooms", "poison_cloud"],
    name: "Garden of Decay",
    description: "Flowers spread poison",
    bonus: {
      damageMultiplier: 1.25,
      specialEffect: "poison_flowers"
    }
  },
  {
    weapons: ["thunder_strike", "laser_beam"],
    name: "Electromagnetic Fury",
    description: "Lightning and lasers chain together",
    bonus: {
      damageMultiplier: 1.4,
      specialEffect: "chain_lightning_laser"
    }
  }
];

export class WeaponSynergySystem {
  private activeWeapons: Set<string> = new Set();
  private activeSynergies: WeaponSynergy[] = [];

  public addWeapon(weaponId: string): void {
    this.activeWeapons.add(weaponId);
    this.updateSynergies();
  }

  public removeWeapon(weaponId: string): void {
    this.activeWeapons.delete(weaponId);
    this.updateSynergies();
  }

  private updateSynergies(): void {
    this.activeSynergies = WEAPON_SYNERGIES.filter(synergy => {
      return synergy.weapons.every(weapon => this.activeWeapons.has(weapon));
    });
  }

  public getActiveSynergies(): WeaponSynergy[] {
    return this.activeSynergies;
  }

  public hasSynergy(weapons: string[]): boolean {
    return this.activeSynergies.some(synergy => 
      synergy.weapons.every(w => weapons.includes(w))
    );
  }

  public getSynergyBonus(weaponId: string): { damageMultiplier: number; cooldownReduction: number; rangeIncrease: number } {
    let damageMultiplier = 1;
    let cooldownReduction = 0;
    let rangeIncrease = 1;

    this.activeSynergies.forEach(synergy => {
      if (synergy.weapons.includes(weaponId)) {
        if (synergy.bonus.damageMultiplier) damageMultiplier *= synergy.bonus.damageMultiplier;
        if (synergy.bonus.cooldownReduction) cooldownReduction += synergy.bonus.cooldownReduction;
        if (synergy.bonus.rangeIncrease) rangeIncrease *= synergy.bonus.rangeIncrease;
      }
    });

    return { damageMultiplier, cooldownReduction, rangeIncrease };
  }
}
