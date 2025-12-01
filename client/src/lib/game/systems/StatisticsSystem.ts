
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

export interface SessionSnapshot {
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
  startTime: number;
}

export class StatisticsSystem {
  private static STORAGE_KEY = "vampire_survivors_statistics";
  private static SESSION_KEY = "vampire_survivors_session";

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

  // Session snapshot methods for mid-run persistence
  static saveSessionSnapshot(snapshot: SessionSnapshot): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(snapshot));
    console.log('[StatisticsSystem] Session snapshot saved - Kills:', snapshot.kills, 'Wave:', snapshot.wave);
  }

  static loadSessionSnapshot(): SessionSnapshot | null {
    const saved = localStorage.getItem(this.SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  static clearSessionSnapshot(): void {
    localStorage.removeItem(this.SESSION_KEY);
    console.log('[StatisticsSystem] Session snapshot cleared');
  }

  static mergeOrphanedSession(): void {
    const snapshot = this.loadSessionSnapshot();
    if (snapshot) {
      console.log('[StatisticsSystem] Merging orphaned session snapshot - Kills:', snapshot.kills);
      const stats = this.load();
      
      stats.totalKills += snapshot.kills;
      stats.bossesDefeated += snapshot.bossesDefeated;
      stats.totalPlayTime += snapshot.playTime;
      stats.totalDamageTaken += snapshot.damageTaken;
      stats.totalDamageDealt += snapshot.damageDealt;
      stats.totalExperienceGained += snapshot.experienceGained;

      if (snapshot.wave > stats.highestWave) stats.highestWave = snapshot.wave;
      if (snapshot.level > stats.highestLevel) stats.highestLevel = snapshot.level;
      if (snapshot.score > stats.highestScore) stats.highestScore = snapshot.score;
      if (snapshot.maxCombo > stats.longestCombo) stats.longestCombo = snapshot.maxCombo;

      if (!stats.characterStats[snapshot.characterId]) {
        stats.characterStats[snapshot.characterId] = {
          runs: 0,
          kills: 0,
          highestWave: 0,
          totalPlayTime: 0
        };
      }

      const charStats = stats.characterStats[snapshot.characterId];
      charStats.kills += snapshot.kills;
      charStats.totalPlayTime += snapshot.playTime;
      if (snapshot.wave > charStats.highestWave) charStats.highestWave = snapshot.wave;

      this.save(stats);
      this.clearSessionSnapshot();
      
      console.log('[StatisticsSystem] Orphaned session merged - New total kills:', stats.totalKills);
    }
  }

  static recoverOrphanedSession(): boolean {
    const snapshot = this.loadSessionSnapshot();
    if (snapshot) {
      console.log('[StatisticsSystem] Found orphaned session, recovering - Kills:', snapshot.kills);
      this.mergeOrphanedSession();
      return true;
    }
    return false;
  }
}
