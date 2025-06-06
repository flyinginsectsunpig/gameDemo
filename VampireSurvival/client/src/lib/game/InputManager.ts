export class InputManager {
  private keys: { [key: string]: boolean } = {};

  public addEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  public removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    // Prevent default behavior for game keys
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public getInput() {
    return {
      up: this.keys["KeyW"] || this.keys["ArrowUp"],
      down: this.keys["KeyS"] || this.keys["ArrowDown"],
      left: this.keys["KeyA"] || this.keys["ArrowLeft"],
      right: this.keys["KeyD"] || this.keys["ArrowRight"],
    };
  }
}
