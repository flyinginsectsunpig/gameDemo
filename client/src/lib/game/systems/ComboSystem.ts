
export class ComboSystem {
  private killCount: number = 0;
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private comboDecayTime: number = 3;
  private maxCombo: number = 0;

  public addKill(): void {
    this.killCount++;
    this.comboCount++;
    this.comboTimer = this.comboDecayTime;
    
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }
  }

  public update(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }
  }

  public getComboMultiplier(): number {
    if (this.comboCount < 5) return 1;
    if (this.comboCount < 10) return 1.25;
    if (this.comboCount < 20) return 1.5;
    if (this.comboCount < 50) return 2;
    return 2.5;
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getMaxCombo(): number {
    return this.maxCombo;
  }

  public getTotalKills(): number {
    return this.killCount;
  }

  public getTimeRemaining(): number {
    return this.comboTimer;
  }

  public reset(): void {
    this.killCount = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
  }
}
