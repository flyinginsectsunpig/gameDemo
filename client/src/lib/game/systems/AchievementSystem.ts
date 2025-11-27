
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: any) => boolean;
  reward?: {
    type: 'currency' | 'character' | 'weapon';
    value: string | number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Kill your first enemy',
    icon: '⚔️',
    requirement: (stats) => stats.totalKills >= 1,
    reward: { type: 'currency', value: 100 }
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Kill 100 enemies in total',
    icon: '💯',
    requirement: (stats) => stats.totalKills >= 100,
    reward: { type: 'currency', value: 500 }
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Reach wave 10',
    icon: '🛡️',
    requirement: (stats) => stats.highestWave >= 10,
    reward: { type: 'currency', value: 300 }
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    icon: '👹',
    requirement: (stats) => stats.bossesDefeated >= 1,
    reward: { type: 'currency', value: 1000 }
  },
  {
    id: 'level_master',
    name: 'Level Master',
    description: 'Reach level 20',
    icon: '⭐',
    requirement: (stats) => stats.highestLevel >= 20,
    reward: { type: 'currency', value: 800 }
  },
  {
    id: 'marathon',
    name: 'Marathon Runner',
    description: 'Play for 30 minutes in one run',
    icon: '⏱️',
    requirement: (stats) => stats.longestRun >= 1800,
    reward: { type: 'currency', value: 1500 }
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Complete wave 5 without taking damage',
    icon: '✨',
    requirement: (stats) => stats.perfectWaves >= 5,
    reward: { type: 'currency', value: 2000 }
  }
];

export class AchievementSystem {
  private unlockedAchievements: Set<string> = new Set();

  public checkAchievements(stats: any): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (!this.unlockedAchievements.has(achievement.id) && achievement.requirement(stats)) {
        this.unlockedAchievements.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  public isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  public getUnlockedCount(): number {
    return this.unlockedAchievements.size;
  }

  public getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  public load(achievements: string[]): void {
    this.unlockedAchievements = new Set(achievements);
  }
}
