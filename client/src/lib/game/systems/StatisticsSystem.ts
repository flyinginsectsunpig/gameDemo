
export interface GameStatistics {
  totalRuns: number;
  totalKills: number;
  totalDeaths: number;
  bossesDefeated: number;
  highestWave: number;
  highestLevel: number;
  highestScore: number;
  totalPlayTime: number;
  totalDamageTaken: number;
  totalDamageDealt: number;
  totalExperienceGained: number;
  longestCombo: number;
  weaponsUnlocked: string[];
  achievementsEarned: string[];
  characterStats: {
    [characterId: string]: {
      runs: number;
      kills: number;
      highestWave: number;
      totalPlayTime: number;
    };
  };
}

export class StatisticsSystem {
  private static STORAGE_KEY = "vampire_survivors_statistics";

  static load(): GameStatistics {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return this.getDefaultStats();
  }

  static save(stats: GameStatistics): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }

  static getDefaultStats(): GameStatistics {
    return {
      totalRuns: 0,
      totalKills: 0,
      totalDeaths: 0,
      bossesDefeated: 0,
      highestWave: 0,
      highestLevel: 0,
      highestScore: 0,
      totalPlayTime: 0,
      totalDamageTaken: 0,
      totalDamageDealt: 0,
      totalExperienceGained: 0,
      longestCombo: 0,
      weaponsUnlocked: [],
      achievementsEarned: [],
      characterStats: {}
    };
  }

  static recordRun(data: {
    characterId: string;
    kills: number;
    wave: number;
    level: number;
    score: number;
    playTime: number;
    damageTaken: number;
    damageDealt: number;
    experienceGained: number;
    maxCombo: number;
    bossesDefeated: number;
  }): void {
    const stats = this.load();
    
    console.log(`[StatisticsSystem] Recording run - Adding ${data.kills} kills to existing ${stats.totalKills}`);

    stats.totalRuns++;
    stats.totalDeaths++;
    stats.totalKills += data.kills;
    stats.bossesDefeated += data.bossesDefeated;
    stats.totalPlayTime += data.playTime;
    stats.totalDamageTaken += data.damageTaken;
    stats.totalDamageDealt += data.damageDealt;
    stats.totalExperienceGained += data.experienceGained;

    if (data.wave > stats.highestWave) stats.highestWave = data.wave;
    if (data.level > stats.highestLevel) stats.highestLevel = data.level;
    if (data.score > stats.highestScore) stats.highestScore = data.score;
    if (data.maxCombo > stats.longestCombo) stats.longestCombo = data.maxCombo;

    // Update character-specific stats
    if (!stats.characterStats[data.characterId]) {
      stats.characterStats[data.characterId] = {
        runs: 0,
        kills: 0,
        highestWave: 0,
        totalPlayTime: 0
      };
    }

    const charStats = stats.characterStats[data.characterId];
    charStats.runs++;
    charStats.kills += data.kills;
    charStats.totalPlayTime += data.playTime;
    if (data.wave > charStats.highestWave) charStats.highestWave = data.wave;

    this.save(stats);
    
    console.log(`[StatisticsSystem] Run recorded - New total kills: ${stats.totalKills}, Total runs: ${stats.totalRuns}`);
  }

  static unlockWeapon(weaponId: string): void {
    const stats = this.load();
    if (!stats.weaponsUnlocked.includes(weaponId)) {
      stats.weaponsUnlocked.push(weaponId);
      this.save(stats);
    }
  }

  static earnAchievement(achievementId: string): void {
    const stats = this.load();
    if (!stats.achievementsEarned.includes(achievementId)) {
      stats.achievementsEarned.push(achievementId);
      this.save(stats);
    }
  }

  static reset(): void {
    this.save(this.getDefaultStats());
  }
}
