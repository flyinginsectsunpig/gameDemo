export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  mute: boolean;
  restart: boolean;
  pause: boolean;
  weapon1: boolean;
  weapon2: boolean;
  weapon3: boolean;
  weapon4: boolean;
  weapon5: boolean;
}

export class InputManager {
  private keys: { [key: string]: boolean };

  constructor() {
    this.keys = {};

    document.addEventListener("keydown", (event) => {
      this.keys[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
    });
  }

  public getInput() {
    return {
      up: this.keys["KeyW"] || this.keys["ArrowUp"],
      down: this.keys["KeyS"] || this.keys["ArrowDown"],
      left: this.keys["KeyA"] || this.keys["ArrowLeft"],
      right: this.keys["KeyD"] || this.keys["ArrowRight"],
      weapon1: this.keys["Digit1"],
      weapon2: this.keys["Digit2"],
      weapon3: this.keys["Digit3"],
      weapon4: this.keys["Digit4"],
      weapon5: this.keys["Digit5"],
      mute: this.keys["KeyM"],
      restart: this.keys["KeyR"],
      pause: this.keys["Escape"]
    };
  }
}