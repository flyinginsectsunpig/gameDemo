
export interface TileMapCell {
  groundTile: number;
  objectTile?: number;
  detailTile?: number;
}

export class TileMapGenerator {
  private static readonly MAP_SIZE = 16;
  
  // Tile indices for different elements (based on the new 5x5 tileset)
  private static readonly GROUND_TILES = {
    BASE_DIRT_1: 0,
    BASE_DIRT_2: 1,
    BASE_DIRT_3: 2,
    BASE_DIRT_CRACK: 3,
    BASE_DIRT_BONE: 4,
    MUD_PATCH: 20,
    STONE_MOSS: 21,
    GRAVEL_CLUSTER: 22
  };

  private static readonly OBJECT_TILES = {
    COFFIN_SLAB_1: 0,
    COFFIN_SLAB_2: 1,
    TWISTED_TREE_1: 2,
    TWISTED_TREE_2: 3,
    BROKEN_TREE: 4,
    STONE_CRYPT: 5,
    BROKEN_ALTAR: 6,
    GRAVESTONE: 7,
    SKELETON_HAND: 8,
    CRYSTAL_FORMATION: 9
  };

  private static readonly DETAIL_TILES = {
    BLOOD_SPLATTER: 15,
    BONE_OVERLAY: 16,
    MOSS_PATCH: 17,
    DEAD_GRASS: 18,
    SMALL_STONE: 19,
    CENTER_CRACKED: 9,
    ROCK_CLUSTER: 14,
    SUBTLE_SHADOW: 23,
    SEAMLESS_FILLER: 24,
    SCATTERED_BONES_1: 25,
    SCATTERED_BONES_2: 26,
    SCATTERED_BONES_3: 27,
    BONE_FRAGMENT: 28,
    SMALL_SKULL: 29,
    ROSE_HIP_SHRUB: 30,
    SMALL_CRYSTAL: 31,
    DEAD_BRANCH: 32,
    DEAD_LEAVES: 33
  };

  public static generateUndeadScene(): TileMapCell[][] {
    const map: TileMapCell[][] = [];
    
    // Initialize base map with varied ground
    for (let y = 0; y < this.MAP_SIZE; y++) {
      map[y] = [];
      for (let x = 0; x < this.MAP_SIZE; x++) {
        map[y][x] = {
          groundTile: this.selectGroundTile(x, y)
        };
      }
    }

    // Place major structures
    this.placeCoffinsAndCrypts(map);
    this.placeTwistedTrees(map);
    this.placeBrokenAltars(map);
    
    // Add atmospheric details
    this.scatterBones(map);
    this.addVegetation(map);
    this.addCrystalFormations(map);

    return map;
  }

  private static selectGroundTile(x: number, y: number): number {
    // Create varied ground using base dirt variants with some randomness
    const seed = (x * 3 + y * 7) % 100;
    
    if (seed < 40) {
      return 0; // Tile at (0,0) - most common
    } else if (seed < 65) {
      return 1; // Tile at (1,0) - common
    } else if (seed < 80) {
      return 2; // Tile at (2,0) - less common
    } else if (seed < 88) {
      return 3; // Tile at (3,0) - rare
    } else if (seed < 94) {
      return 4; // Tile at (0,1) - very rare
    } else if (seed < 97) {
      return 8; // Tile at (0,2) - extremely rare
    } else {
      return 12; // Tile at (0,3) - ultra rare
    }
  }

  private static placeCoffinsAndCrypts(map: TileMapCell[][]) {
    // Place coffin slabs in strategic locations
    const coffins = [
      { x: 3, y: 4 }, { x: 12, y: 6 }, { x: 7, y: 11 }, { x: 14, y: 13 }
    ];

    coffins.forEach((pos, index) => {
      if (this.isValidPosition(pos.x, pos.y)) {
        map[pos.y][pos.x].objectTile = index % 2 === 0 ? 
          this.OBJECT_TILES.COFFIN_SLAB_1 : this.OBJECT_TILES.COFFIN_SLAB_2;
      }
    });

    // Place stone crypts
    const crypts = [
      { x: 1, y: 2 }, { x: 9, y: 8 }, { x: 13, y: 3 }
    ];

    crypts.forEach(pos => {
      if (this.isValidPosition(pos.x, pos.y)) {
        map[pos.y][pos.x].objectTile = this.OBJECT_TILES.STONE_CRYPT;
      }
    });
  }

  private static placeTwistedTrees(map: TileMapCell[][]) {
    const trees = [
      { x: 1, y: 8 }, { x: 6, y: 2 }, { x: 11, y: 14 }, 
      { x: 14, y: 7 }, { x: 4, y: 13 }, { x: 8, y: 5 }
    ];

    trees.forEach((pos, index) => {
      if (this.isValidPosition(pos.x, pos.y)) {
        if (index % 3 === 0) {
          map[pos.y][pos.x].objectTile = this.OBJECT_TILES.TWISTED_TREE_1;
        } else if (index % 3 === 1) {
          map[pos.y][pos.x].objectTile = this.OBJECT_TILES.TWISTED_TREE_2;
        } else {
          map[pos.y][pos.x].objectTile = this.OBJECT_TILES.BROKEN_TREE;
        }
      }
    });
  }

  private static placeBrokenAltars(map: TileMapCell[][]) {
    const altars = [
      { x: 5, y: 9 }, { x: 10, y: 3 }
    ];

    altars.forEach(pos => {
      if (this.isValidPosition(pos.x, pos.y)) {
        map[pos.y][pos.x].objectTile = this.OBJECT_TILES.BROKEN_ALTAR;
      }
    });
  }

  private static scatterBones(map: TileMapCell[][]) {
    for (let y = 0; y < this.MAP_SIZE; y++) {
      for (let x = 0; x < this.MAP_SIZE; x++) {
        // Skip cells that already have objects
        if (map[y][x].objectTile !== undefined) continue;

        const boneChance = (x * 3 + y * 7) % 100;
        
        if (boneChance < 8) {
          map[y][x].detailTile = this.DETAIL_TILES.BONE_OVERLAY;
        } else if (boneChance < 15) {
          map[y][x].detailTile = this.DETAIL_TILES.BLOOD_SPLATTER;
        } else if (boneChance < 20) {
          map[y][x].detailTile = this.DETAIL_TILES.SMALL_STONE;
        } else if (boneChance < 25) {
          map[y][x].detailTile = this.DETAIL_TILES.CENTER_CRACKED;
        } else if (boneChance < 30) {
          map[y][x].detailTile = this.DETAIL_TILES.ROCK_CLUSTER;
        }

        // Add skeleton hands emerging from ground
        if (boneChance >= 95) {
          map[y][x].objectTile = this.OBJECT_TILES.SKELETON_HAND;
        }
      }
    }
  }

  private static addVegetation(map: TileMapCell[][]) {
    for (let y = 0; y < this.MAP_SIZE; y++) {
      for (let x = 0; x < this.MAP_SIZE; x++) {
        if (map[y][x].objectTile !== undefined || map[y][x].detailTile !== undefined) continue;

        const vegChance = (x * 5 + y * 9) % 100;
        
        if (vegChance < 6) {
          map[y][x].detailTile = this.DETAIL_TILES.MOSS_PATCH;
        } else if (vegChance < 12) {
          map[y][x].detailTile = this.DETAIL_TILES.DEAD_GRASS;
        } else if (vegChance < 18) {
          map[y][x].detailTile = this.DETAIL_TILES.SUBTLE_SHADOW;
        } else if (vegChance < 22) {
          map[y][x].detailTile = this.DETAIL_TILES.SEAMLESS_FILLER;
        }
      }
    }
  }

  private static addCrystalFormations(map: TileMapCell[][]) {
    const crystals = [
      { x: 2, y: 12 }, { x: 15, y: 1 }, { x: 8, y: 7 }
    ];

    crystals.forEach((pos, index) => {
      if (this.isValidPosition(pos.x, pos.y) && map[pos.y][pos.x].objectTile === undefined) {
        if (index % 2 === 0) {
          map[pos.y][pos.x].objectTile = this.OBJECT_TILES.CRYSTAL_FORMATION;
        } else {
          map[pos.y][pos.x].detailTile = this.DETAIL_TILES.ROCK_CLUSTER;
        }
      }
    });
  }

  private static isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.MAP_SIZE && y >= 0 && y < this.MAP_SIZE;
  }

  public static exportAsGrid(map: TileMapCell[][]): string {
    let output = "=== UNDEAD TILESET MAP (16x16) ===\n\n";
    output += "Legend:\n";
    output += "Ground: . (earth) # (stone) ~ (moss) * (corrupted)\n";
    output += "Objects: C (coffin) T (tree) A (altar) H (hand) X (crypt)\n";
    output += "Details: b (bones) s (skull) r (rose-hip) c (crystal)\n\n";

    for (let y = 0; y < this.MAP_SIZE; y++) {
      for (let x = 0; x < this.MAP_SIZE; x++) {
        const cell = map[y][x];
        let char = '.';

        // Priority: Objects > Details > Ground
        if (cell.objectTile !== undefined) {
          switch (cell.objectTile) {
            case this.OBJECT_TILES.COFFIN_SLAB_1:
            case this.OBJECT_TILES.COFFIN_SLAB_2:
              char = 'C'; break;
            case this.OBJECT_TILES.TWISTED_TREE_1:
            case this.OBJECT_TILES.TWISTED_TREE_2:
            case this.OBJECT_TILES.BROKEN_TREE:
              char = 'T'; break;
            case this.OBJECT_TILES.BROKEN_ALTAR:
              char = 'A'; break;
            case this.OBJECT_TILES.SKELETON_HAND:
              char = 'H'; break;
            case this.OBJECT_TILES.STONE_CRYPT:
              char = 'X'; break;
            case this.OBJECT_TILES.CRYSTAL_FORMATION:
              char = 'Y'; break;
            default: char = '?';
          }
        } else if (cell.detailTile !== undefined) {
          switch (cell.detailTile) {
            case this.DETAIL_TILES.SCATTERED_BONES_1:
            case this.DETAIL_TILES.SCATTERED_BONES_2:
            case this.DETAIL_TILES.SCATTERED_BONES_3:
            case this.DETAIL_TILES.BONE_FRAGMENT:
              char = 'b'; break;
            case this.DETAIL_TILES.SMALL_SKULL:
              char = 's'; break;
            case this.DETAIL_TILES.ROSE_HIP_SHRUB:
              char = 'r'; break;
            case this.DETAIL_TILES.SMALL_CRYSTAL:
              char = 'c'; break;
            case this.DETAIL_TILES.MOSS_PATCH:
              char = '~'; break;
            case this.DETAIL_TILES.DEAD_BRANCH:
            case this.DETAIL_TILES.DEAD_LEAVES:
              char = 'd'; break;
            default: char = ',';
          }
        } else {
          // Ground tiles
          switch (cell.groundTile) {
            case this.GROUND_TILES.BASE_DIRT_1:
              char = '.'; break;
            case this.GROUND_TILES.BASE_DIRT_2:
              char = ','; break;
            case this.GROUND_TILES.BASE_DIRT_3:
              char = ':'; break;
            case this.GROUND_TILES.BASE_DIRT_CRACK:
              char = '/'; break;
            case this.GROUND_TILES.BASE_DIRT_BONE:
              char = 'B'; break;
            case this.GROUND_TILES.MUD_PATCH:
              char = 'm'; break;
            case this.GROUND_TILES.STONE_MOSS:
              char = '~'; break;
            case this.GROUND_TILES.GRAVEL_CLUSTER:
              char = '#'; break;
            default: char = '.';
          }
        }

        output += char + ' ';
      }
      output += '\n';
    }

    return output;
  }
}
