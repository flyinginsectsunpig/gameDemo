
export interface PlayerStats {
  totalKills: number;
  totalRuns: number;
  highestWave: number;
  highestScore: number;
  totalPlayTime: number;
  achievements: string[];
  unlockedCharacters: string[];
  permanentUpgrades: Record<string, number>;
  currency: number;
}

export interface SaveData {
  version: string;
  lastPlayed: Date;
  stats: PlayerStats;
  settings: {
    volume: number;
    sfxVolume: number;
    isMuted: boolean;
  };
}

export class SaveSystem {
  private static readonly SAVE_KEY = "vampire_survivors_save";
  private static readonly VERSION = "1.0.0";

  public static save(data: Partial<SaveData>): void {
    const existingData = this.load();
    const saveData: SaveData = {
      ...existingData,
      ...data,
      version: this.VERSION,
      lastPlayed: new Date()
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log("Game saved successfully");
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  public static load(): SaveData {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) {
        return this.getDefaultSave();
      }

      const data = JSON.parse(saved) as SaveData;
      
      if (data.version !== this.VERSION) {
        console.warn("Save version mismatch, migrating...");
        return this.migrateSave(data);
      }

      return data;
    } catch (error) {
      console.error("Failed to load save:", error);
      return this.getDefaultSave();
    }
  }

  public static getDefaultSave(): SaveData {
    return {
      version: this.VERSION,
      lastPlayed: new Date(),
      stats: {
        totalKills: 0,
        totalRuns: 0,
        highestWave: 0,
        highestScore: 0,
        totalPlayTime: 0,
        achievements: [],
        unlockedCharacters: ["warrior"],
        permanentUpgrades: {},
        currency: 0
      },
      settings: {
        volume: 0.3,
        sfxVolume: 0.5,
        isMuted: false
      }
    };
  }

  private static migrateSave(oldData: SaveData): SaveData {
    return {
      ...this.getDefaultSave(),
      ...oldData,
      version: this.VERSION
    };
  }

  public static updateStats(updates: Partial<PlayerStats>): void {
    const data = this.load();
    data.stats = { ...data.stats, ...updates };
    this.save(data);
  }

  public static addCurrency(amount: number): void {
    const data = this.load();
    data.stats.currency += amount;
    this.save(data);
  }

  public static spendCurrency(amount: number): boolean {
    const data = this.load();
    if (data.stats.currency >= amount) {
      data.stats.currency -= amount;
      this.save(data);
      return true;
    }
    return false;
  }

  public static unlockCharacter(characterId: string): void {
    const data = this.load();
    if (!data.stats.unlockedCharacters.includes(characterId)) {
      data.stats.unlockedCharacters.push(characterId);
      this.save(data);
    }
  }

  public static unlockAchievement(achievementId: string): void {
    const data = this.load();
    if (!data.stats.achievements.includes(achievementId)) {
      data.stats.achievements.push(achievementId);
      this.save(data);
    }
  }

  public static reset(): void {
    localStorage.removeItem(this.SAVE_KEY);
    console.log("Save data reset");
  }
}
