
import { PowerUpDefinition } from "../entities/collectibles/PowerUp";
import { IPlayer } from "../core/interfaces/IPlayer";

import { IPlayer } from '../core/interfaces/IPlayer';

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  characterRestriction?: string;
  apply: (player: IPlayer) => void;
}

export const POWERUP_DEFINITIONS: PowerUpDefinition[] = [
  {
    id: "speed_boost",
    name: "Speed Boost",
    description: "Increase movement speed by 15%",
    color: "#00BFFF",
    apply: (player: IPlayer) => {
      const speed = player.getSpeed();
      player.setSpeed(speed * 1.15);
    }
  },
  {
    id: "health_boost",
    name: "Health Boost",
    description: "Increase maximum health by 20",
    color: "#FF1493",
    apply: (player: IPlayer) => {
      const maxHealth = player.getMaxHealth();
      const currentHealth = player.getHealth();
      player.heal(20);
    }
  },
  {
    id: "damage_boost",
    name: "Damage Boost",
    description: "Increase weapon damage by 25%",
    color: "#FF4500",
    apply: (player: IPlayer) => {
      const weapon = player.getWeapon();
      if (weapon && 'upgradeDamage' in weapon) {
        (weapon as any).upgradeDamage();
      }
    }
  },
  {
    id: "projectile_speed",
    name: "Projectile Speed",
    description: "Increase projectile speed by 20%",
    color: "#FFD700",
    apply: (player: IPlayer) => {
      const weapon = player.getWeapon();
      if (weapon && 'projectileSpeed' in weapon) {
        (weapon as any).projectileSpeed *= 1.2;
      }
    }
  },
  {
    id: "fire_rate",
    name: "Fire Rate",
    description: "Reduce cooldown between attacks by 15%",
    color: "#FFA500",
    apply: (player: IPlayer) => {
      const weapon = player.getWeapon();
      if (weapon && 'upgradeFireRate' in weapon) {
        (weapon as any).upgradeFireRate();
      }
    }
  },
  {
    id: "sylph_bloom_upgrade",
    name: "Bloom Enhancement",
    description: "Increase bloom damage and growth speed",
    color: "#98FB98",
    characterRestriction: "sylph",
    apply: (player: IPlayer) => {
      const weapon = player.getWeapon();
      if (weapon && weapon.constructor.name === "SylphBloomsWeapon") {
        (weapon as any).upgradeFlowerCapacity();
      }
    }
  },
  {
    id: "big_spider",
    name: "Big Mechanical Spider",
    description: "Deploy one powerful mechanical spider",
    color: "#8B4513",
    characterRestriction: "assassin",
    apply: (player: IPlayer) => {
      if ('setBigSpiderMode' in player) {
        (player as any).setBigSpiderMode();
      }
    }
  },
  {
    id: "small_spiders",
    name: "Small Spider Swarm",
    description: "Deploy multiple agile spiders",
    color: "#CD853F",
    characterRestriction: "assassin",
    apply: (player: IPlayer) => {
      if ('setSmallSpidersMode' in player) {
        (player as any).setSmallSpidersMode();
      }
    }
  }
];
