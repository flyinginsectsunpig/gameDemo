import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";
import { PersistentProgressionSystem } from "../game/systems/PersistentProgressionSystem";

export type GamePhase = "ready" | "playing" | "ended" | "levelUp" | "characterSelect" | "paused" | "gameOver";

export type CharacterType = {
  id?: string;
  name: string;
  stats: {
    health: number;
  }
}

interface GameState {
  phase: GamePhase;
  score: number;
  health: number;
  maxHealth: number;
  wave: number;
  experience: number;
  experienceToNext: number;
  level: number;
  selectedCharacter: CharacterType | null;
  spiderMode: "normal" | "big" | "small";

  isBossActive: boolean;
  currentBossHealth: number;
  currentBossMaxHealth: number;
  bossName: string;
  bossDescription: string;
  currency: number;
  totalKills: number;
  bossesDefeated: number;
  showBossWarning: boolean;
  isPaused: boolean;
  comboCount: number;
  comboMultiplier: number;
  maxCombo: number;
  comboTimeRemaining: number;

  start: () => void;
  restart: () => void;
  end: () => void;
  showLevelUp: () => void;
  hideLevelUp: () => void;
  showCharacterSelect: () => void;
  selectCharacter: (character: CharacterType) => void;
  addScore: (points: number) => void;
  takeDamage: (damage: number) => void;
  upgradeHealth: () => void;
  nextWave: () => void;
  addExperience: (exp: number) => void;
  levelUp: () => void;
  resumeFromLevelUp: () => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  setWave: (wave: number) => void;
  setSpiderMode: (mode: "normal" | "big" | "small") => void;
  pause: () => void;
  resume: () => void;
  setMaxHealth: (maxHealth: number) => void; // Added method

  setBossActive: (active: boolean) => void;
  updateBossHealth: (health: number, maxHealth: number) => void;
  setBossInfo: (name: string, description: string) => void;
  triggerBossWarning: (name: string, description: string) => void;
  hideBossWarning: () => void;
  onBossDefeated: () => void;
  addCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => void;
  addKill: () => void;
  addBossKill: () => void;
  updateCombo: (combo: number, multiplier: number) => void;
  setCombo: (combo: number, multiplier: number, timeRemaining?: number) => void;
  resetCombo: () => void;
  heal: (amount: number) => void; // Added method and modified implementation
}

const getInitialCurrency = () => {
  try {
    const saved = localStorage.getItem("vampire_survivors_save");
    if (saved) {
      const data = JSON.parse(saved);
      return data.currency || 0;
    }
  } catch (error) {
    console.error("Failed to load initial currency:", error);
  }
  return 0;
};

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    score: 0,
    health: 100,
    maxHealth: 100,
    wave: 1,
    experience: 0,
    experienceToNext: 100,
    level: 1,
    selectedCharacter: null,
    spiderMode: "normal",

    isBossActive: false,
    currentBossHealth: 0,
    currentBossMaxHealth: 0,
    bossName: "",
    bossDescription: "",
    currency: getInitialCurrency(),
    totalKills: 0,
    bossesDefeated: 0,
    showBossWarning: false,
    isPaused: false,
    comboCount: 0,
    comboMultiplier: 1,
    maxCombo: 0,
    comboTimeRemaining: 0,

    start: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "characterSelect" };
        }
        return {};
      });
    },

    restart: () => {
      const persistentData = PersistentProgressionSystem.load();
      
      set(() => ({
        phase: "characterSelect",
        score: 0,
        health: 100,
        maxHealth: 100,
        wave: 1,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        selectedCharacter: null,
        spiderMode: "normal",
        isBossActive: false,
        currentBossHealth: 0,
        currentBossMaxHealth: 0,
        bossName: "",
        bossDescription: "",
        currency: persistentData.currency, // Preserve currency from persistence
        totalKills: 0, // Session-only, reset each run
        bossesDefeated: 0, // Session-only, reset each run
        showBossWarning: false,
        isPaused: false,
        comboCount: 0,
        comboMultiplier: 1,
        maxCombo: 0,
        comboTimeRemaining: 0
      }));
    },

    end: () => {
      set((state) => {
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },

    showLevelUp: () => {
      set(() => ({ phase: "levelUp" }));
    },

    hideLevelUp: () => {
      set(() => ({ phase: "playing" }));
    },

    showCharacterSelect: () => {
      set(() => ({ phase: "characterSelect" }));
    },

    selectCharacter: (character: CharacterType) => {
      set({ selectedCharacter: character, phase: "playing" });
    },

    setScore: (score) => set({ score }),
    setHealth: (health) => set({ health }),
    setWave: (wave) => set({ wave }),
    setMaxHealth: (maxHealth: number) => set({ maxHealth }), // Added method

    takeDamage: (amount) => {
      set((state) => {
        const newHealth = Math.max(0, state.health - amount);

        // Play player hurt sound
        const audioState = useAudio.getState();
        if (!audioState.isMuted && newHealth > 0) {
          audioState.playPlayerHurt();
        }

        if (newHealth <= 0) {
          return { health: 0, phase: "gameOver" as const };
        }
        return { health: newHealth };
      });
    },

    addScore: (points: number) => {
      const { score, experience } = get();
      const newScore = score + points;
      const newExp = experience + points;
      set({ score: newScore, experience: newExp });

      const { experienceToNext } = get();
      if (newExp >= experienceToNext) {
        get().levelUp();
      }
    },

    addExperience: (amount) => {
      set((state) => {
        const newExperience = state.experience + amount;
        if (newExperience >= state.experienceToNext) {
          const overflow = newExperience - state.experienceToNext;
          const newLevel = state.level + 1;
          const newExpToNext = Math.floor(state.experienceToNext * 1.5);

          // Play level up sound and trigger celebration
          const audioState = useAudio.getState();
          if (!audioState.isMuted) {
            audioState.playLevelUp();
          }

          // Trigger level-up celebration effect
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('levelUp', { detail: { level: newLevel } });
            window.dispatchEvent(event);
          }

          return {
            experience: overflow,
            level: newLevel,
            experienceToNext: newExpToNext,
            phase: "levelUp" as const
          };
        }
        return { experience: newExperience };
      });
    },

    levelUp: () => {
      const { level, experienceToNext } = get();
      const newLevel = level + 1;
      const newExpToNext = Math.floor(experienceToNext * 1.5);

      set({ 
        phase: "levelUp",
        level: newLevel,
        experienceToNext: newExpToNext,
        experience: 0
      });
    },

    resumeFromLevelUp: () => {
      set({ phase: "playing" });
    },

    upgradeHealth: () => {
      const { health, maxHealth } = get();
      const newMaxHealth = maxHealth + 25;
      const newHealth = Math.min(health + 50, newMaxHealth);
      set({ health: newHealth, maxHealth: newMaxHealth });
    },

    setSpiderMode: (mode: "normal" | "big" | "small") => {
      set({ spiderMode: mode });
    },

    nextWave: () => {
      const { wave } = get();
      set({ wave: wave + 1 });
    },

    pause: () => {
      set((state) => {
        if (state.phase === "playing") {
          return { isPaused: true, phase: "paused" as const };
        }
        return state;
      });
    },

    resume: () => {
      set((state) => {
        if (state.phase === "paused") {
          return { isPaused: false, phase: "playing" as const };
        }
        return state;
      });
    },

    setBossActive: (active: boolean) => {
      set({ isBossActive: active });
      if (!active) {
        set({ 
          currentBossHealth: 0, 
          currentBossMaxHealth: 0,
          bossName: "",
          bossDescription: ""
        });
      }
    },

    updateBossHealth: (health: number, maxHealth: number) => {
      set({ 
        currentBossHealth: health, 
        currentBossMaxHealth: maxHealth 
      });
    },

    setBossInfo: (name: string, description: string) => {
      set({ 
        bossName: name,
        bossDescription: description
      });
    },

    triggerBossWarning: (name: string, description: string) => {
      set({ 
        showBossWarning: true,
        bossName: name,
        bossDescription: description
      });
    },

    hideBossWarning: () => {
      set({ showBossWarning: false });
    },

    onBossDefeated: () => {
      const { score } = get();
      const bonusScore = 1000;
      set({ 
        isBossActive: false,
        currentBossHealth: 0,
        currentBossMaxHealth: 0,
        score: score + bonusScore
      });
    },

    addCurrency: (amount: number) => {
      PersistentProgressionSystem.addCurrency(amount);
      set((state) => ({ currency: state.currency + amount }));
    },

    spendCurrency: (amount: number) => {
      const success = PersistentProgressionSystem.spendCurrency(amount);
      if (success) {
        set((state) => ({ 
          currency: Math.max(0, state.currency - amount) 
        }));
      }
    },

    addKill: () => {
      set((state) => ({ totalKills: state.totalKills + 1 }));
    },

    addBossKill: () => {
      set((state) => ({ bossesDefeated: state.bossesDefeated + 1 }));
    },

    setCombo: (combo: number, multiplier: number, timeRemaining: number = 0) => {
      set((state) => ({
        comboCount: combo,
        comboMultiplier: multiplier,
        maxCombo: Math.max(state.maxCombo, combo),
        comboTimeRemaining: timeRemaining
      }));
    },

    updateCombo: (combo: number, multiplier: number) => {
      set((state) => ({
        comboCount: combo,
        comboMultiplier: multiplier,
        maxCombo: Math.max(state.maxCombo, combo)
      }));
    },

    resetCombo: () => {
      set({ comboCount: 0, comboMultiplier: 1 });
    },

    heal: (amount: number) => { // Modified implementation for heal
      set((state) => {
        const newHealth = Math.min(state.maxHealth, state.health + amount);
        console.log(`Healing: ${state.health} + ${amount} = ${newHealth} (max: ${state.maxHealth})`);
        return { health: newHealth };
      });
    },
  }))
);
