
import { EntityManager } from '../managers/EntityManager';
import { GameStateManager } from './GameStateManager';
import { CollisionDetection } from './CollisionDetection';
import { BossEnemy } from '../entities/enemies/BossEnemy';
import { SylphBloomsWeapon } from '../weapons/SylphBloomsWeapon';
import { useGameState } from '../../stores/useGameState';
import { useAudio } from '../../stores/useAudio';
import { ExperienceOrb } from '../entities/collectibles/ExperienceOrb';

export class CollisionHandler {
  private entityManager: EntityManager;
  private gameStateManager: GameStateManager;
  private collisionDetection: CollisionDetection;

  constructor(entityManager: EntityManager, gameStateManager: GameStateManager) {
    this.entityManager = entityManager;
    this.gameStateManager = gameStateManager;
    this.collisionDetection = new CollisionDetection();
  }

  public handleAllCollisions() {
    this.handleProjectileEnemyCollisions();
    this.handleEnemyProjectilePlayerCollisions();
    this.handlePlayerEnemyCollisions();
    this.handleOrbitalWeaponCollisions();
    this.handleWeaponCollisions();
    this.handleExperienceOrbCollection();
    this.handleBossLootCollection();
  }

  private handleProjectileEnemyCollisions() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    const projectiles = this.entityManager.getProjectiles();
    const enemies = this.entityManager.getEnemies();

    projectiles.forEach(projectile => {
      if (!projectile.isAlive()) return;

      enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(projectile, enemy)) {
          if (!this.collisionDetection.canDamageEnemy(enemy)) {
            this.entityManager.createHitParticles(enemy.x, enemy.y, "#0088ff");
            return;
          }

          const damage = projectile.getDamage();
          enemy.takeDamage(damage);
          this.gameStateManager.addDamageDealt(damage);
          projectile.addHit();
          this.entityManager.createHitParticles(enemy.x, enemy.y);
          this.entityManager.addDamageNumber(enemy.x, enemy.y - 20, damage, false);

          if (!audioState.isMuted) {
            audioState.playHit();
          }

          if (!enemy.isAlive() && !(enemy instanceof BossEnemy)) {
            this.handleEnemyDeath(enemy);
          }
        }
      });
    });
  }

  private handleEnemyProjectilePlayerCollisions() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    const player = this.entityManager.getPlayer();
    const enemyProjectiles = this.entityManager.getEnemyProjectiles();

    enemyProjectiles.forEach(projectile => {
      if (!projectile.isAlive()) return;

      if (this.collisionDetection.checkEnemyProjectilePlayerCollision(projectile, player)) {
        const damage = projectile.getDamage();
        this.gameStateManager.addDamageTaken(damage);
        gameState.takeDamage(damage);
        projectile.markForRemoval();
        this.entityManager.createHitParticles(player.x, player.y, "#cc00cc");

        if (!audioState.isMuted) {
          audioState.playHit();
        }
      }
    });
  }

  private handlePlayerEnemyCollisions() {
    const gameState = useGameState.getState();
    const player = this.entityManager.getPlayer();
    const enemies = this.entityManager.getEnemies();

    enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;

      if (this.collisionDetection.checkCollision(player, enemy)) {
        const damage = enemy.getDamage();
        this.gameStateManager.addDamageTaken(damage);
        gameState.takeDamage(damage);

        // Knockback
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          enemy.x += (dx / distance) * 30;
          enemy.y += (dy / distance) * 30;
        }

        this.entityManager.createHitParticles(player.x, player.y, "#ff4444");
      }
    });
  }

  private handleOrbitalWeaponCollisions() {
    const audioState = useAudio.getState();
    const player = this.entityManager.getPlayer();
    const enemies = this.entityManager.getEnemies();
    const orbitalWeapons = player.getOrbitalWeapons();

    orbitalWeapons.forEach(orbital => {
      enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;

        if (this.collisionDetection.checkCollision(orbital, enemy)) {
          if (!this.collisionDetection.canDamageEnemy(enemy)) {
            this.entityManager.createHitParticles(orbital.x, orbital.y, "#0088ff");
            return;
          }

          const damage = orbital.dealDamage();
          if (damage > 0) {
            enemy.takeDamage(damage);
            this.entityManager.createHitParticles(orbital.x, orbital.y, "#4444ff");

            if (!audioState.isMuted) {
              audioState.playHit();
            }

            if (!enemy.isAlive() && !(enemy instanceof BossEnemy)) {
              this.handleEnemyDeath(enemy);
            }
          }
        }
      });
    });
  }

  private handleWeaponCollisions() {
    const audioState = useAudio.getState();
    const player = this.entityManager.getPlayer();
    const weapon = player.getWeapon();
    const enemies = this.entityManager.getEnemies();

    if (weapon instanceof SylphBloomsWeapon) {
      const orbCollisions = weapon.checkCollisions(enemies);

      orbCollisions.forEach(collision => {
        this.entityManager.createHitParticles(collision.orbX, collision.orbY);

        if (!audioState.isMuted) {
          audioState.playHit();
        }

        if (!collision.enemy.isAlive() && !(collision.enemy instanceof BossEnemy)) {
          this.handleEnemyDeath(collision.enemy);
        }
      });
    }
  }

  private handleExperienceOrbCollection() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    const player = this.entityManager.getPlayer();
    const orbs = this.entityManager.getExperienceOrbs();

    orbs.forEach((orb, index) => {
      if (orb.canBeCollected(player.getPosition())) {
        gameState.addExperience(orb.getValue());
        orb.collect();

        if (!audioState.isMuted) {
          audioState.playSuccess();
        }
      }
    });
  }

  private handleBossLootCollection() {
    const gameState = useGameState.getState();
    const audioState = useAudio.getState();
    const player = this.entityManager.getPlayer();
    const loot = this.entityManager.getBossLoot();

    loot.forEach(item => {
      if (item.canBeCollected(player.getPosition())) {
        item.collect();
        const lootValue = 100;
        gameState.addCurrency(lootValue);

        if (!audioState.isMuted) {
          audioState.playSuccess();
        }
      }
    });
  }

  private handleEnemyDeath(enemy: any) {
    const gameState = useGameState.getState();
    this.gameStateManager.addKill();
    const scoreWithCombo = Math.floor(enemy.getScoreValue() * this.gameStateManager.getComboMultiplier());
    gameState.addScore(scoreWithCombo);
    this.entityManager.createHitParticles(enemy.x, enemy.y);
    const expValue = Math.max(1, Math.floor(enemy.getScoreValue() / 2));
    this.entityManager.addExperienceOrb(new ExperienceOrb(enemy.x, enemy.y, expValue));
    
    const goldValue = Math.max(1, Math.floor(enemy.getScoreValue() / 10));
    gameState.addCurrency(goldValue);
  }
}
