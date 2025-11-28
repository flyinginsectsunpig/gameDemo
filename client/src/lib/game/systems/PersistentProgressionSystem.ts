
import { useGameState } from "../../stores/useGameState";

export interface PersistentData {
  totalKills: number;
  totalRuns: number;
  highScore: number;
  currency: number;
  unlockedCharacters: string[];
  permanentUpgrades: {
    maxHealth: number;
    damage: number;
    speed: number;
    pickupRange: number;
    luck: number;
  };
  achievements: string[];
  statistics: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalPlayTime: number;
    bossesDefeated: number;
    maxWave: number;
    maxCombo: number;
  };
}

export class PersistentProgressionSystem {
  private static SAVE_KEY = "vampire_survivors_save";

  static getDefaultData(): PersistentData {
    return {
      totalKills: 0,
      totalRuns: 0,
      highScore: 0,
      currency: 0,
      unlockedCharacters: ["guardian"],
      permanentUpgrades: {
        maxHealth: 0,
        damage: 0,
        speed: 0,
        pickupRange: 0,
        luck: 0,
      },
      achievements: [],
      statistics: {
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalPlayTime: 0,
        bossesDefeated: 0,
        maxWave: 0,
        maxCombo: 0,
      },
    };
  }

  static save(data: Partial<PersistentData>): void {
    try {
      const existing = this.load();
      const merged = { ...existing, ...data };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(merged));
      console.log("Game saved successfully");
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  static load(): PersistentData {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return this.getDefaultData();
      
      const data = JSON.parse(saved);
      return { ...this.getDefaultData(), ...data };
    } catch (error) {
      console.error("Failed to load game:", error);
      return this.getDefaultData();
    }
  }

  static updateStatistics(stats: Partial<PersistentData["statistics"]>): void {
    const data = this.load();
    data.statistics = { ...data.statistics, ...stats };
    this.save(data);
  }

  static addCurrency(amount: number): void {
    const data = this.load();
    const oldCurrency = data.currency;
    data.currency += amount;
    this.save(data);
    console.log(`Currency updated: ${oldCurrency} + ${amount} = ${data.currency}`);
  }

  static spendCurrency(amount: number): boolean {
    const data = this.load();
    if (data.currency >= amount) {
      data.currency -= amount;
      this.save(data);
      return true;
    }
    return false;
  }

  static unlockCharacter(characterId: string): void {
    const data = this.load();
    if (!data.unlockedCharacters.includes(characterId)) {
      data.unlockedCharacters.push(characterId);
      this.save(data);
    }
  }

  static isCharacterUnlocked(characterId: string): boolean {
    const data = this.load();
    return data.unlockedCharacters.includes(characterId);
  }

  static upgradePermanent(upgrade: keyof PersistentData["permanentUpgrades"]): boolean {
    const cost = this.getUpgradeCost(upgrade);
    if (this.spendCurrency(cost)) {
      const data = this.load();
      data.permanentUpgrades[upgrade] += 1;
      this.save(data);
      return true;
    }
    return false;
  }

  static getUpgradeCost(upgrade: keyof PersistentData["permanentUpgrades"]): number {
    const data = this.load();
    const level = data.permanentUpgrades[upgrade];
    return Math.floor(100 * Math.pow(1.5, level));
  }

  static unlockAchievement(achievementId: string): void {
    const data = this.load();
    if (!data.achievements.includes(achievementId)) {
      data.achievements.push(achievementId);
      this.save(data);
      
      // Trigger achievement notification
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('achievement', { detail: { id: achievementId } });
        window.dispatchEvent(event);
      }
    }
  }

  static recordRunEnd(score: number, wave: number, kills: number, combo: number, bossesDefeated: number, playTime: number): void {
    const data = this.load();
    
    data.totalRuns += 1;
    data.totalKills += kills;
    data.highScore = Math.max(data.highScore, score);
    data.statistics.maxWave = Math.max(data.statistics.maxWave, wave);
    data.statistics.maxCombo = Math.max(data.statistics.maxCombo, combo);
    data.statistics.bossesDefeated += bossesDefeated;
    data.statistics.totalPlayTime += playTime;
    
    this.save(data);
  }

  static reset(): void {
    localStorage.removeItem(this.SAVE_KEY);
    console.log("Save data reset");
  }
}
