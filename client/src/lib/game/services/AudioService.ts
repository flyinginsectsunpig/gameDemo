
import { IAudioService } from './IAudioService';
import { useAudio } from '../../stores/useAudio';

export class AudioService implements IAudioService {
  public playHit(): void {
    const audioState = useAudio.getState();
    if (!audioState.isMuted) {
      audioState.playHit();
    }
  }

  public playSuccess(): void {
    const audioState = useAudio.getState();
    if (!audioState.isMuted) {
      audioState.playSuccess();
    }
  }

  public playBackgroundMusic(): void {
    const audioState = useAudio.getState();
    if (audioState.backgroundMusic && !audioState.isMuted) {
      audioState.backgroundMusic.play().catch(console.warn);
    }
  }

  public stopBackgroundMusic(): void {
    const audioState = useAudio.getState();
    if (audioState.backgroundMusic) {
      audioState.backgroundMusic.pause();
    }
  }

  public toggleMute(): void {
    const audioState = useAudio.getState();
    audioState.toggleMute();

    if (audioState.backgroundMusic) {
      if (audioState.isMuted) {
        this.stopBackgroundMusic();
      } else {
        this.playBackgroundMusic();
      }
    }
  }

  public isMuted(): boolean {
    return useAudio.getState().isMuted;
  }
}
