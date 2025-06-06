import { GameObject } from "./Player";

export type PowerUpType = "speed" | "damage" | "orbital" | "fireRate" | "health" | "spreadShot" | "rapidFire" | "multiShot" | "piercing";

export interface PowerUpDefinition {
  id: PowerUpType;
  name: string;
  description: string;
  color: string;
  apply: (player: any) => void;
}

export class PowerUp implements GameObject {
  public x: number;
  public y: number;
  public width = 24;
  public height = 24;
  public type: PowerUpType;
  private lifetime = 15; // seconds before disappearing
  private pulseTime = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public update(deltaTime: number) {
    this.lifetime -= deltaTime;
    this.pulseTime += deltaTime * 4; // For pulsing animation
  }

  public isExpired(): boolean {
    return this.lifetime <= 0;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(this.pulseTime) * 0.2 + 1;
    const size = this.width * pulse;
    
    // Get color based on type
    let color = "#ffffff";
    switch (this.type) {
      case "speed": color = "#44ff44"; break;
      case "damage": color = "#ff4444"; break;
      case "orbital": color = "#4444ff"; break;
      case "fireRate": color = "#ffff44"; break;
      case "health": color = "#ff44ff"; break;
      case "spreadShot": color = "#ff8844"; break;
      case "rapidFire": color = "#44ffff"; break;
      case "multiShot": color = "#8844ff"; break;
      case "piercing": color = "#ffff88"; break;
    }

    // Draw outer glow
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fillRect(
      this.x - size / 2,
      this.y - size / 2,
      size,
      size
    );

    // Draw inner core
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      this.x - size / 4,
      this.y - size / 4,
      size / 2,
      size / 2
    );
    ctx.restore();

    // Draw lifetime indicator
    const lifetimePercent = this.lifetime / 15;
    ctx.fillStyle = "#333333";
    ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 2, this.width, 3);
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.width / 2, this.y + this.height / 2 + 2, this.width * lifetimePercent, 3);
  }
}

import { SpreadShotWeapon, RapidFireWeapon, MultiDirectionalWeapon, PiercingWeapon } from "./WeaponTypes";

export const POWERUP_DEFINITIONS: PowerUpDefinition[] = [
  {
    id: "speed",
    name: "Speed Boost",
    description: "Increases movement speed by 20%",
    color: "#44ff44",
    apply: (player) => {
      player.speed *= 1.2;
    }
  },
  {
    id: "damage",
    name: "Damage Up",
    description: "Increases weapon damage by 50%",
    color: "#ff4444",
    apply: (player) => {
      player.weapon.upgradeDamage();
    }
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    description: "Increases fire rate by 30%",
    color: "#ffff44",
    apply: (player) => {
      player.weapon.upgradeFireRate();
    }
  },
  {
    id: "orbital",
    name: "Orbital Shield",
    description: "Adds a spinning shield that damages enemies",
    color: "#4444ff",
    apply: (player) => {
      player.addOrbitalWeapon();
    }
  },
  {
    id: "health",
    name: "Health Boost",
    description: "Restores 50 health and increases max health",
    color: "#ff44ff",
    apply: (player) => {
      player.upgradeHealth();
    }
  },
  {
    id: "spreadShot",
    name: "Spread Shot",
    description: "Replaces weapon with a shotgun-style spread",
    color: "#ff8844",
    apply: (player) => {
      player.setWeapon(new SpreadShotWeapon());
    }
  },
  {
    id: "rapidFire",
    name: "Rapid Fire",
    description: "Replaces weapon with rapid-fire bullets",
    color: "#44ffff",
    apply: (player) => {
      player.setWeapon(new RapidFireWeapon());
    }
  },
  {
    id: "multiShot",
    name: "Multi-Shot",
    description: "Fires in all directions simultaneously",
    color: "#8844ff",
    apply: (player) => {
      player.setWeapon(new MultiDirectionalWeapon());
    }
  },
  {
    id: "piercing",
    name: "Piercing Shot",
    description: "Bullets pierce through multiple enemies",
    color: "#ffff88",
    apply: (player) => {
      player.setWeapon(new PiercingWeapon());
    }
  }
];