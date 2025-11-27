
import { PowerUpDefinition } from "../entities/collectibles/PowerUp";
import { IPlayer } from "../core/interfaces/IPlayer";

export const POWERUP_DEFINITIONS: PowerUpDefinition[] = [
  {
    id: "speed_boost",
    name: "Speed Boost",
    description: "Increase movement speed by 15%",
    color: "#00BFFF",
    apply: (player: IPlayer) => {
      player.speed *= 1.15;
    }
  },
  {
    id: "health_boost",
    name: "Health Boost",
    description: "Increase maximum health by 20",
    color: "#FF1493",
    apply: (player: IPlayer) => {
      player.maxHealth += 20;
      player.health = Math.min(player.health + 20, player.maxHealth);
    }
  },
  {
    id: "damage_boost",
    name: "Damage Boost",
    description: "Increase weapon damage by 25%",
    color: "#FF4500",
    apply: (player: IPlayer) => {
      player.weapons.forEach(weapon => {
        weapon.damage *= 1.25;
      });
    }
  },
  {
    id: "projectile_speed",
    name: "Projectile Speed",
    description: "Increase projectile speed by 20%",
    color: "#FFD700",
    apply: (player: IPlayer) => {
      player.weapons.forEach(weapon => {
        if ('projectileSpeed' in weapon) {
          (weapon as any).projectileSpeed *= 1.2;
        }
      });
    }
  },
  {
    id: "fire_rate",
    name: "Fire Rate",
    description: "Reduce cooldown between attacks by 15%",
    color: "#FFA500",
    apply: (player: IPlayer) => {
      player.weapons.forEach(weapon => {
        weapon.cooldown *= 0.85;
      });
    }
  },
  {
    id: "sylph_bloom_upgrade",
    name: "Bloom Enhancement",
    description: "Increase bloom damage and growth speed",
    color: "#98FB98",
    characterRestriction: "sylph",
    apply: (player: IPlayer) => {
      player.weapons.forEach(weapon => {
        if (weapon.constructor.name === "SylphBloomsWeapon") {
          weapon.upgrade();
        }
      });
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
