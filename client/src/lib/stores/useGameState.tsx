import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended" | "levelUp";

interface GameState {
  phase: GamePhase;
  score: number;
  health: number;
  maxHealth: number;
  wave: number;
  experience: number;
  level: number;
  experienceToNext: number;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  setWave: (wave: number) => void;
  takeDamage: (damage: number) => void;
  addScore: (points: number) => void;
  addExperience: (exp: number) => void;
  levelUp: () => void;
  resumeFromLevelUp: () => void;
  upgradeHealth: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    score: 0,
    health: 100,
    maxHealth: 100,
    wave: 1,
    experience: 0,
    level: 1,
    experienceToNext: 100,
    
    start: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({
        phase: "ready",
        score: 0,
        health: 100,
        maxHealth: 100,
        wave: 1,
        experience: 0,
        level: 1,
        experienceToNext: 100,
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
  }))
);
