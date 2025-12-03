
export class GameLoopController {
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: (deltaTime: number) => void;

  constructor(updateCallback: (deltaTime: number) => void, renderCallback: (deltaTime: number) => void) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  public start() {
    this.gameLoop(0);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.02);
    this.lastTime = currentTime;

    this.updateCallback(deltaTime);
    this.renderCallback(deltaTime);
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
