import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
  showBossWarning: boolean;
  isPaused: boolean;

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

  setBossActive: (active: boolean) => void;
  updateBossHealth: (health: number, maxHealth: number) => void;
  setBossInfo: (name: string, description: string) => void;
  triggerBossWarning: (name: string, description: string) => void;
  hideBossWarning: () => void;
  onBossDefeated: () => void;
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

    isBossActive: false,
    currentBossHealth: 0,
    currentBossMaxHealth: 0,
    bossName: "",
    bossDescription: "",
    showBossWarning: false,
    isPaused: false,

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
        spiderMode: "normal",
        isBossActive: false,
        currentBossHealth: 0,
        currentBossMaxHealth: 0,
        bossName: "",
        bossDescription: "",
        showBossWarning: false,
        isPaused: false
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

    addScore: (points) => {
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

          // Play level up sound
          const audioState = useAudio.getState();
          if (!audioState.isMuted) {
            audioState.playLevelUp();
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
    }
  }))
);