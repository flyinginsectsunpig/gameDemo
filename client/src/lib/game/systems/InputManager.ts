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
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      mute: false,
      restart: false,
      pause: false,
      weapon1: false,
      weapon2: false,
      weapon3: false,
      weapon4: false,
      weapon5: false
    };
  }

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
    // Prevent default behavior for game keys (except Escape which should bubble to modals)
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
      weapon1: this.keys["1"],
      weapon2: this.keys["2"],
      weapon3: this.keys["3"],
      weapon4: this.keys["4"],
      weapon5: this.keys["5"],
      mute: this.keys["m"] || this.keys["M"],
      restart: this.keys["r"] || this.keys["R"],
      pause: this.keys["Escape"]
    };
  }

  private isKeyPressed(key: string): boolean {
    return this.keys[key] === true;
  }

  public update() {
    this.keys.left = this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A');
    this.keys.right = this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D');
    this.keys.up = this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed('W');
    this.keys.down = this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.isKeyPressed('S');
    this.keys.mute = this.isKeyPressed('m') || this.isKeyPressed('M');
    this.keys.restart = this.isKeyPressed('r') || this.isKeyPressed('R');
    this.keys.pause = this.isKeyPressed('Escape');

    // Debug keys for weapon testing
    this.keys.weapon1 = this.isKeyPressed('1');
    this.keys.weapon2 = this.isKeyPressed('2');
    this.keys.weapon3 = this.isKeyPressed('3');
    this.keys.weapon4 = this.isKeyPressed('4');
    this.keys.weapon5 = this.isKeyPressed('5');
  }
}