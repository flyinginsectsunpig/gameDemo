
import { IPlayer } from '../core/interfaces/IPlayer';
import { Player } from '../entities/characters/Player';
import { AssassinPlayer } from '../entities/characters/AssassinPlayer';

export type PlayerType = 'sylph' | 'assassin';

export class PlayerFactory {
  public static createPlayer(type: PlayerType, x: number, y: number): IPlayer {
    switch (type) {
      case 'assassin':
        return new AssassinPlayer(x, y);
      case 'sylph':
      default:
        return new Player(x, y);
    }
  }
}
