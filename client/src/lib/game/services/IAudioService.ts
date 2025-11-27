
export interface IAudioService {
  playHit(): void;
  playSuccess(): void;
  playBackgroundMusic(): void;
  stopBackgroundMusic(): void;
  toggleMute(): void;
  isMuted(): boolean;
}
