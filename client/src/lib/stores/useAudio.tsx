import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  bossMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  levelUpSound: HTMLAudioElement | null;
  playerHurtSound: HTMLAudioElement | null;
  victorySound: HTMLAudioElement | null;
  defeatSound: HTMLAudioElement | null;
  isMuted: boolean;
  musicVolume: number;
  sfxVolume: number;

  // Setter functions
  setBackgroundMusic: (audio: HTMLAudioElement) => void;
  setBossMusic: (audio: HTMLAudioElement) => void;
  setHitSound: (audio: HTMLAudioElement) => void;
  setSuccessSound: (audio: HTMLAudioElement) => void;
  setLevelUpSound: (audio: HTMLAudioElement) => void;
  setPlayerHurtSound: (audio: HTMLAudioElement) => void;
  setVictorySound: (audio: HTMLAudioElement) => void;
  setDefeatSound: (audio: HTMLAudioElement) => void;

  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playLevelUp: () => void;
  playPlayerHurt: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playBossMusic: () => void;
  stopBossMusic: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  bossMusic: null,
  hitSound: null,
  successSound: null,
  levelUpSound: null,
  playerHurtSound: null,
  victorySound: null,
  defeatSound: null,
  isMuted: true, // Start muted by default
  musicVolume: 0.3,
  sfxVolume: 0.5,

  setBackgroundMusic: (audio) => set({ backgroundMusic: audio }),
  setBossMusic: (audio) => set({ bossMusic: audio }),
  setHitSound: (audio) => set({ hitSound: audio }),
  setSuccessSound: (audio) => set({ successSound: audio }),
  setLevelUpSound: (audio) => set({ levelUpSound: audio }),
  setPlayerHurtSound: (audio) => set({ playerHurtSound: audio }),
  setVictorySound: (audio) => set({ victorySound: audio }),
  setDefeatSound: (audio) => set({ defeatSound: audio }),

  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMuted = !isMuted;

    if (backgroundMusic) {
      if (newMuted) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch((e) => {
          console.log("Background music play prevented:", e);
        });
      }
    }

    set({ isMuted: newMuted });
  },

  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const clone = hitSound.cloneNode() as HTMLAudioElement;
      clone.volume = hitSound.volume;
      clone.play().catch((e) => {
        console.log("Hit sound play prevented:", e);
      });
    }
  },

  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      const clone = successSound.cloneNode() as HTMLAudioElement;
      clone.volume = successSound.volume;
      clone.play().catch((e) => {
        console.log("Success sound play prevented:", e);
      });
    }
  },

  playLevelUp: () => {
    const { levelUpSound, isMuted } = get();
    if (levelUpSound && !isMuted) {
      const clone = levelUpSound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.8;
      clone.play().catch((e) => {
        console.log("Level up sound play prevented:", e);
      });
    }
  },

  playPlayerHurt: () => {
    const { playerHurtSound, isMuted, sfxVolume } = get();
    if (playerHurtSound && !isMuted) {
      const clone = playerHurtSound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.6 * sfxVolume;
      clone.play().catch((e) => {
        console.log("Player hurt sound play prevented:", e);
      });
    }
  },

  playVictory: () => {
    const { victorySound, isMuted, sfxVolume } = get();
    if (victorySound && !isMuted) {
      const clone = victorySound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.7 * sfxVolume;
      clone.play().catch((e) => {
        console.log("Victory sound play prevented:", e);
      });
    }
  },

  playDefeat: () => {
    const { defeatSound, isMuted, sfxVolume } = get();
    if (defeatSound && !isMuted) {
      const clone = defeatSound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.7 * sfxVolume;
      clone.play().catch((e) => {
        console.log("Defeat sound play prevented:", e);
      });
    }
  },

  playBossMusic: () => {
    const { bossMusic, backgroundMusic, isMuted, musicVolume } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    if (bossMusic && !isMuted) {
      bossMusic.volume = musicVolume;
      bossMusic.play().catch((e) => {
        console.log("Boss music play prevented:", e);
      });
    }
  },

  stopBossMusic: () => {
    const { bossMusic, backgroundMusic, isMuted, musicVolume } = get();
    if (bossMusic) {
      bossMusic.pause();
      bossMusic.currentTime = 0;
    }
    if (backgroundMusic && !isMuted) {
      backgroundMusic.volume = musicVolume;
      backgroundMusic.play().catch((e) => {
        console.log("Background music play prevented:", e);
      });
    }
  },

  setMusicVolume: (volume: number) => {
    const { backgroundMusic, bossMusic } = get();
    set({ musicVolume: volume });
    if (backgroundMusic) {
      backgroundMusic.volume = volume;
    }
    if (bossMusic) {
      bossMusic.volume = volume;
    }
  },

  setSfxVolume: (volume: number) => {
    set({ sfxVolume: volume });
  },
}));