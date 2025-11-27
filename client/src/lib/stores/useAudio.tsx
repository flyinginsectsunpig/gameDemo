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
    const { isMuted } = get();
    const newMutedState = !isMuted;

    // Just update the muted state
    set({ isMuted: newMutedState });

    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },

  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }

      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },

  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }

      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  playLevelUp: () => {
    const { levelUpSound, isMuted } = get();
    if (levelUpSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Level up sound skipped (muted)");
        return;
      }

      levelUpSound.currentTime = 0;
      levelUpSound.play().catch(error => {
        console.log("Level up sound play prevented:", error);
      });
    }
  },

  playPlayerHurt: () => {
    const { playerHurtSound, isMuted } = get();
    if (playerHurtSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Player hurt sound skipped (muted)");
        return;
      }

      playerHurtSound.currentTime = 0;
      playerHurtSound.play().catch(error => {
        console.log("Player hurt sound play prevented:", error);
      });
    }
  }
}));