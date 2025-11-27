
export class ScreenShake {
  private intensity: number = 0;
  private duration: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;

  public shake(intensity: number, duration: number): void {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
  }

  public update(deltaTime: number): void {
    if (this.duration > 0) {
      this.duration -= deltaTime;
      
      const currentIntensity = this.intensity * (this.duration / 0.5);
      this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
      this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;

      if (this.duration <= 0) {
        this.intensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
      }
    }
  }

  public getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  public isActive(): boolean {
    return this.duration > 0;
  }
}
