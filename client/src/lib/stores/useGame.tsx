import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;

  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
}

interface GameStore {
  engine: GameEngine | null;
  setEngine: (engine: GameEngine | null) => void;
  player: { x: number; y: number } | null;
  enemies: Array<{ x: number; y: number; isBoss?: boolean }>;
  updateGameData: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",

    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },

    restart: () => {
      set(() => ({ phase: "ready" }));
    },

    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    }
  }))
);

export const useGameStore = create<GameStore>((set, get) => ({
  engine: null,
  setEngine: (engine) => set({ engine }),
  player: null,
  enemies: [],
  updateGameData: () => {
    const { engine } = get();
    if (engine) {
      const player = engine.getPlayer();
      const enemies = engine.getEnemies();
      set({
        player: player ? { x: player.x, y: player.y } : null,
        enemies: enemies || []
      });
    } else {
      set({ player: null, enemies: [] });
    }
  },
}));