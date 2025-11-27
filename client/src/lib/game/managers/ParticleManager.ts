
import { Particle } from "../rendering/Particle";

export class ParticleManager {
  private particles: Particle[] = [];

  public createHitParticles(x: number, y: number, color = "#ffff44"): void {
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        color,
        0.5
      ));
    }
  }

  public createDeathParticles(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        Math.random() > 0.5 ? "#ff4444" : "#ff8844",
        1.0
      ));
    }
  }

  public update(deltaTime: number): void {
    this.particles = this.particles.filter(p => p.isAlive());
    this.particles.forEach(p => p.update(deltaTime));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => p.render(ctx));
  }

  public clear(): void {
    this.particles = [];
  }
}
