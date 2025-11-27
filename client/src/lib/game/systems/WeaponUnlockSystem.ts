
export interface WeaponUnlockRequirement {
  weaponId: string;
  name: string;
  description: string;
  unlocked: boolean;
  requirements: {
    level?: number;
    kills?: number;
    bossKills?: number;
    wave?: number;
    currency?: number;
  };
}

export const WEAPON_UNLOCKS: WeaponUnlockRequirement[] = [
  {
    weaponId: "sylph_blooms",
    name: "Sylph Blooms",
    description: "Magical flower turrets",
    unlocked: true,
    requirements: {}
  },
  {
    weaponId: "orbital",
    name: "Orbital Shield",
    description: "Rotating protective orbs",
    unlocked: true,
    requirements: {}
  },
  {
    weaponId: "thunder_strike",
    name: "Thunder Strike",
    description: "Lightning bolts from above",
    unlocked: false,
    requirements: { level: 5, kills: 50 }
  },
  {
    weaponId: "poison_cloud",
    name: "Poison Cloud",
    description: "Toxic area damage",
    unlocked: false,
    requirements: { level: 8, kills: 100 }
  },
  {
    weaponId: "laser_beam",
    name: "Laser Beam",
    description: "Piercing laser damage",
    unlocked: false,
    requirements: { level: 10, bossKills: 1 }
  },
  {
    weaponId: "ice_nova",
    name: "Ice Nova",
    description: "Freezing wave attack",
    unlocked: false,
    requirements: { wave: 15, kills: 200 }
  },
  {
    weaponId: "boomerang",
    name: "Boomerang",
    description: "Returning projectile",
    unlocked: false,
    requirements: { currency: 1000, kills: 150 }
  }
];

export class WeaponUnlockSystem {
  private unlocks: Map<string, boolean> = new Map();

  constructor() {
    WEAPON_UNLOCKS.forEach(weapon => {
      this.unlocks.set(weapon.weaponId, weapon.unlocked);
    });
  }

  public checkUnlocks(stats: {
    level: number;
    totalKills: number;
    bossesDefeated: number;
    wave: number;
    currency: number;
  }): string[] {
    const newlyUnlocked: string[] = [];

    WEAPON_UNLOCKS.forEach(weapon => {
      if (this.unlocks.get(weapon.weaponId)) return;

      const req = weapon.requirements;
      let canUnlock = true;

      if (req.level && stats.level < req.level) canUnlock = false;
      if (req.kills && stats.totalKills < req.kills) canUnlock = false;
      if (req.bossKills && stats.bossesDefeated < req.bossKills) canUnlock = false;
      if (req.wave && stats.wave < req.wave) canUnlock = false;
      if (req.currency && stats.currency < req.currency) canUnlock = false;

      if (canUnlock) {
        this.unlocks.set(weapon.weaponId, true);
        newlyUnlocked.push(weapon.weaponId);
      }
    });

    return newlyUnlocked;
  }

  public isUnlocked(weaponId: string): boolean {
    return this.unlocks.get(weaponId) || false;
  }

  public getUnlockedWeapons(): string[] {
    const unlocked: string[] = [];
    this.unlocks.forEach((isUnlocked, weaponId) => {
      if (isUnlocked) unlocked.push(weaponId);
    });
    return unlocked;
  }

  public getProgress(weaponId: string, stats: any): { current: number; required: number; type: string }[] {
    const weapon = WEAPON_UNLOCKS.find(w => w.weaponId === weaponId);
    if (!weapon) return [];

    const progress: { current: number; required: number; type: string }[] = [];
    const req = weapon.requirements;

    if (req.level) progress.push({ current: stats.level, required: req.level, type: "Level" });
    if (req.kills) progress.push({ current: stats.totalKills, required: req.kills, type: "Kills" });
    if (req.bossKills) progress.push({ current: stats.bossesDefeated, required: req.bossKills, type: "Boss Kills" });
    if (req.wave) progress.push({ current: stats.wave, required: req.wave, type: "Wave" });
    if (req.currency) progress.push({ current: stats.currency, required: req.currency, type: "Currency" });

    return progress;
  }
}
