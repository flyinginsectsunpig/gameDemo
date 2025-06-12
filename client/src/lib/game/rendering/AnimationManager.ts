
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
      // Always reset the animation state when starting a new animation
      this.currentAnimations.set(instanceId, {
        currentFrame: 0,
        elapsed: 0,
        playing: true
      });
    }
  }

  public update(deltaTime: number, instanceId: string, animationName: string): AnimationFrame | null {
    const animation = this.animations.get(animationName);
    let state = this.currentAnimations.get(instanceId);
    
    if (!animation) {
      console.warn(`Animation ${animationName} not found`);
      return null;
    }

    // Ensure deltaTime is a valid number
    const validDeltaTime = typeof deltaTime === 'number' && !isNaN(deltaTime) ? deltaTime : 0.016; // fallback to ~60fps
    
    if (typeof deltaTime !== 'number' || isNaN(deltaTime)) {
      console.warn(`Invalid deltaTime received: ${typeof deltaTime} (${deltaTime}), using fallback`);
    }

    // Initialize state if it doesn't exist
    if (!state) {
      state = {
        currentFrame: 0,
        elapsed: 0,
        playing: true
      };
      this.currentAnimations.set(instanceId, state);
      console.log(`Initialized animation state for ${animationName}, frames: ${animation.frames.length}, frameDuration: ${animation.frameDuration}`);
    }

    if (!state.playing) {
      return animation.frames[state.currentFrame] || animation.frames[0];
    }

    state.elapsed += validDeltaTime;

    if (state.elapsed >= animation.frameDuration) {
      const oldFrame = state.currentFrame;
      state.elapsed = 0; // Reset elapsed time completely
      state.currentFrame++;

      if (state.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          state.currentFrame = 0;
        } else {
          state.currentFrame = animation.frames.length - 1;
          state.playing = false;
        }
      }

      // Only log frame changes occasionally to avoid spam
      if (Math.random() < 0.1) {
        console.log(`Animation ${animationName}: frame ${oldFrame} -> ${state.currentFrame} (${animation.frames.length} total)`);
      }
    }

    return animation.frames[state.currentFrame] || animation.frames[0];
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
