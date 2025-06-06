
export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationDefinition {
  frames: AnimationFrame[];
  frameDuration: number; // seconds per frame
  loop: boolean;
}

export class AnimationManager {
  private animations: Map<string, AnimationDefinition> = new Map();
  private currentAnimations: Map<string, {
    currentFrame: number;
    elapsed: number;
    playing: boolean;
  }> = new Map();

  public addAnimation(name: string, frames: AnimationFrame[], frameDuration: number = 0.1, loop: boolean = true) {
    this.animations.set(name, {
      frames,
      frameDuration,
      loop
    });
  }

  public startAnimation(animationName: string, instanceId: string) {
    if (this.animations.has(animationName)) {
      this.currentAnimations.set(instanceId, {
        currentFrame: 0,
        elapsed: 0,
        playing: true
      });
    }
  }

  public update(deltaTime: number, instanceId: string, animationName: string): AnimationFrame | null {
    const animation = this.animations.get(animationName);
    const state = this.currentAnimations.get(instanceId);
    
    if (!animation || !state || !state.playing) {
      return animation ? animation.frames[0] : null;
    }

    state.elapsed += deltaTime;

    if (state.elapsed >= animation.frameDuration) {
      state.elapsed = 0;
      state.currentFrame++;

      if (state.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          state.currentFrame = 0;
        } else {
          state.currentFrame = animation.frames.length - 1;
          state.playing = false;
        }
      }
    }

    return animation.frames[state.currentFrame];
  }

  public getCurrentFrame(instanceId: string, animationName: string): AnimationFrame | null {
    const animation = this.animations.get(animationName);
    const state = this.currentAnimations.get(instanceId);
    
    if (!animation || !state) {
      return animation ? animation.frames[0] : null;
    }

    return animation.frames[state.currentFrame];
  }
}
