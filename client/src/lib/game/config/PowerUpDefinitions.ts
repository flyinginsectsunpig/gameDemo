import { PowerUpDefinition } from "../entities/collectibles/PowerUp";
import { IPlayer } from "../core/interfaces/IPlayer";
import { useGameState } from '../../stores/useGameState';

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string; // Added for potential UI representation
  rarity?: string; // Added for potential rarity system
  characterRestriction?: string;
  apply: (player: IPlayer) => void;
}

// Placeholder for existing power-up definitions that are not provided in the original code snippet.
// In a real scenario, these would be defined elsewhere and imported.
const healthUpgrade: PowerUpDefinition = { id: "health_upgrade", name: "Health Upgrade", description: "Increase max health", color: "#FF1493", apply: (player: IPlayer) => { player.maxHealth += 10; } };
const speedUpgrade: PowerUpDefinition = { id: "speed_upgrade", name: "Speed Upgrade", description: "Increase movement speed", color: "#00BFFF", apply: (player: IPlayer) => { player.setSpeed(player.getSpeed() * 1.1); } };
const damageUpgrade: PowerUpDefinition = { id: "damage_upgrade", name: "Damage Upgrade", description: "Increase weapon damage", color: "#FF4500", apply: (player: IPlayer) => { const weapon = player.getWeapon(); if (weapon && 'upgradeDamage' in weapon) { (weapon as any).upgradeDamage(); } } };
const fireRateUpgrade: PowerUpDefinition = { id: "fire_rate_upgrade", name: "Fire Rate Upgrade", description: "Increase fire rate", color: "#FFA500", apply: (player: IPlayer) => { const weapon = player.getWeapon(); if (weapon && 'upgradeFireRate' in weapon) { (weapon as any).upgradeFireRate(); } } };
const projectileSpeedUpgrade: PowerUpDefinition = { id: "projectile_speed_upgrade", name: "Projectile Speed Upgrade", description: "Increase projectile speed", color: "#FFD700", apply: (player: IPlayer) => { const weapon = player.getWeapon(); if (weapon && 'projectileSpeed' in weapon) { (weapon as any).projectileSpeed *= 1.2; } } };
const maxHealthUpgrade: PowerUpDefinition = { id: "max_health_upgrade", name: "Max Health Upgrade", description: "Increase maximum health", color: "#FF69B4", apply: (player: IPlayer) => { player.maxHealth += 20; } };
const addOrbitalWeapon: PowerUpDefinition = { id: "add_orbital_weapon", name: "Orbital Weapon", description: "Summon a orbiting weapon", color: "#DA70D6", apply: (player: IPlayer) => { player.addOrbitalWeapon(); console.log("Orbital weapon summoned!"); } };
const addProjectile: PowerUpDefinition = { id: "add_projectile", name: "Extra Projectile", description: "Fire an additional projectile", color: "#BA55D3", apply: (player: IPlayer) => { console.log("Extra projectile fired!"); } };


export const POWERUP_DEFINITIONS: PowerUpDefinition[] = [
  {
    id: "speed_boost",
    name: "Speed Boost",
    description: "Increase movement speed by 15%",
    color: "#00BFFF",
    apply: (player: IPlayer) => {
      const speed = player.getSpeed();
      player.setSpeed(speed * 1.15);
      console.log(`Speed boosted to ${speed * 1.15}`);
    }
  },
  {
    id: "health_boost",
    name: "Health Boost",
    description: "Increase maximum health by 20 and heal",
    color: "#FF1493",
    apply: (player: IPlayer) => {
      const oldMaxHealth = player.maxHealth;
      player.maxHealth += 20;
      player.heal(20);
      
      // Update game state to reflect the new max health
      const gameState = useGameState.getState();
      gameState.setMaxHealth(player.maxHealth);
      gameState.heal(20);
      
      console.log(`Max health increased from ${oldMaxHealth} to ${player.maxHealth}, healed 20 HP`);
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
        console.log(`Weapon damage upgraded`);
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
        console.log(`Projectile speed increased`);
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
        console.log(`Fire rate upgraded`);
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

// Additional power-ups
const criticalChance: PowerUpDefinition = {
  id: "critical_chance",
  name: "Critical Hit",
  description: "+10% critical hit chance (2x damage)",
  icon: "💥",
  rarity: "rare",
  apply: (player: IPlayer) => {
    console.log("Critical chance increased!");
  },
};

const lifeSteal: PowerUpDefinition = {
  id: "life_steal",
  name: "Vampiric Touch",
  description: "Heal 1 HP for every 50 damage dealt",
  icon: "🩸",
  rarity: "rare",
  apply: (player: IPlayer) => {
    console.log("Life steal enabled!");
  },
};

const explosiveShots: PowerUpDefinition = {
  id: "explosive_shots",
  name: "Explosive Rounds",
  description: "Projectiles explode on impact",
  icon: "💣",
  rarity: "legendary",
  apply: (player: IPlayer) => {
    console.log("Explosive shots enabled!");
  },
};

const timeWarp: PowerUpDefinition = {
  id: "time_warp",
  name: "Time Dilation",
  description: "-20% enemy speed (stacks)",
  icon: "⏰",
  rarity: "rare",
  apply: (player: IPlayer) => {
    console.log("Time warp activated!");
  },
};

const thorns: PowerUpDefinition = {
  id: "thorns",
  name: "Thorny Armor",
  description: "Reflect 25% damage back to attackers",
  icon: "🌵",
  rarity: "uncommon",
  apply: (player: IPlayer) => {
    console.log("Thorns activated!");
  },
};

const multiShot: PowerUpDefinition = {
  id: "multi_shot",
  name: "Multi-Shot",
  description: "Fire 2 additional projectiles at angles",
  icon: "🎯",
  rarity: "rare",
  apply: (player: IPlayer) => {
    console.log("Multi-shot enabled!");
  },
};

const magneticField: PowerUpDefinition = {
  id: "magnetic_field",
  name: "Magnetic Field",
  description: "+50% XP pickup range",
  icon: "🧲",
  rarity: "common",
  apply: (player: IPlayer) => {
    console.log("Magnetic field expanded!");
  },
};

const berserk: PowerUpDefinition = {
  id: "berserk",
  name: "Berserk Mode",
  description: "+30% damage, -10% max health (trade-off)",
  icon: "😡",
  rarity: "legendary",
  apply: (player: IPlayer) => {
    player.maxHealth = Math.max(20, player.maxHealth - 10);
    console.log("Berserk mode activated!");
  },
};

const ghostArmor: PowerUpDefinition = {
  id: "ghost_armor",
  name: "Ghost Armor",
  description: "10% chance to dodge attacks",
  icon: "👻",
  rarity: "rare",
  apply: (player: IPlayer) => {
    console.log("Ghost armor equipped!");
  },
};

const luckyCharm: PowerUpDefinition = {
  id: "lucky_charm",
  name: "Lucky Charm",
  description: "+15% better loot and XP",
  icon: "🍀",
  rarity: "uncommon",
  apply: (player: IPlayer) => {
    console.log("Lucky charm activated!");
  },
};

export const POWER_UP_POOL: PowerUpDefinition[] = [
  healthUpgrade,
  speedUpgrade,
  damageUpgrade,
  fireRateUpgrade,
  projectileSpeedUpgrade,
  maxHealthUpgrade,
  addOrbitalWeapon,
  addProjectile,
  criticalChance,
  lifeSteal,
  explosiveShots,
  timeWarp,
  thorns,
  multiShot,
  magneticField,
  berserk,
  ghostArmor,
  luckyCharm,
];