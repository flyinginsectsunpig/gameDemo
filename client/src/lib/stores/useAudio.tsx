import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  levelUpSound: HTMLAudioElement | null;
  playerHurtSound: HTMLAudioElement | null;
  isMuted: boolean;

  // Setter functions
  setBackgroundMusic: (audio: HTMLAudioElement) => void;
  setHitSound: (audio: HTMLAudioElement) => void;
  setSuccessSound: (audio: HTMLAudioElement) => void;
  setLevelUpSound: (audio: HTMLAudioElement) => void;
  setPlayerHurtSound: (audio: HTMLAudioElement) => void;

  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playLevelUp: () => void;
  playPlayerHurt: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  levelUpSound: null,
  playerHurtSound: null,
  isMuted: true, // Start muted by default

  setBackgroundMusic: (audio) => set({ backgroundMusic: audio }),
  setHitSound: (audio) => set({ hitSound: audio }),
  setSuccessSound: (audio) => set({ successSound: audio }),
  setLevelUpSound: (audio) => set({ levelUpSound: audio }),
  setPlayerHurtSound: (audio) => set({ playerHurtSound: audio }),

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
    const { playerHurtSound, isMuted } = get();
    if (playerHurtSound && !isMuted) {
      const clone = playerHurtSound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.6;
      clone.play().catch((e) => {
        console.log("Player hurt sound play prevented:", e);
      });
    }
  },
}));