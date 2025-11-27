
import { IGameStateService } from './IGameStateService';
import { useGameState } from '../../stores/useGameState';

export class GameStateService implements IGameStateService {
  public addScore(points: number): void {
    useGameState.getState().addScore(points);
  }

  public addExperience(amount: number): void {
    useGameState.getState().addExperience(amount);
  }

  public takeDamage(amount: number): void {
    useGameState.getState().takeDamage(amount);
  }

  public setWave(wave: number): void {
    useGameState.getState().setWave(wave);
  }

  public getCurrentPhase(): string {
    return useGameState.getState().phase;
  }
}
