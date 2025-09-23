import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended" | "levelUp" | "characterSelect";

export type CharacterType = {
  name: string;
  stats: {
    health: number;
    // Add other stats as needed
  }
  // Add other character properties as needed
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

  // Actions
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
  upgradeHealth: () => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  setWave: (wave: number) => void;
  setSpiderMode: (mode: "normal" | "big" | "small") => void;
}

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

    start: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "characterSelect" };
        }
        return {};
      });
    },

    restart: () => {
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
        spiderMode: "normal"
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

    takeDamage: (damage) => {
      const { health } = get();
      const newHealth = Math.max(0, health - damage);
      set({ health: newHealth });

      if (newHealth <= 0) {
        get().end();
      }
    },

    addScore: (points) => {
      const { score, experience } = get();
      const newScore = score + points;
      const newExp = experience + points;
      set({ score: newScore, experience: newExp });

      // Check for level up
      const { experienceToNext, level } = get();
      if (newExp >= experienceToNext) {
        get().levelUp();
      }
    },

    addExperience: (exp) => {
      const { experience } = get();
      const newExp = experience + exp;
      set({ experience: newExp });

      // Check for level up
      const { experienceToNext } = get();
      if (newExp >= experienceToNext) {
        get().levelUp();
      }
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
  }))
);