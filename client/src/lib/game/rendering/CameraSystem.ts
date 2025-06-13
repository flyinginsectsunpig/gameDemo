
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CameraSystem {
  public x: number = 0;
  public y: number = 0;
  public width: number;
  public height: number;
  private followSpeed: number = 0.1;
  private smoothing: boolean = false;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public update(targetX: number, targetY: number, deltaTime: number): void {
    // Center the camera on the target - use pixel-perfect positioning
    this.x = Math.floor(targetX - this.width / 2);
    this.y = Math.floor(targetY - this.height / 2);
  }

  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public setFollowSpeed(speed: number): void {
    this.followSpeed = speed;
  }

  public setSmoothing(enabled: boolean): void {
    this.smoothing = enabled;
  }

  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  public isInView(worldX: number, worldY: number, objectWidth: number = 0, objectHeight: number = 0): boolean {
    return !(worldX + objectWidth < this.x || 
             worldX > this.x + this.width ||
             worldY + objectHeight < this.y || 
             worldY > this.y + this.height);
  }

  public getViewBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}
