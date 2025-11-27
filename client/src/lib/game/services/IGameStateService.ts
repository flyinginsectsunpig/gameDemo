
export interface IGameStateService {
  addScore(points: number): void;
  addExperience(amount: number): void;
  takeDamage(amount: number): void;
  setWave(wave: number): void;
  getCurrentPhase(): string;
}
