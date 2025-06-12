
export interface TileDefinition {
  id: number;
  name: string;
  solid: boolean;
  variants?: number[];
}

export class UndeadTileMap {
  // Tile definitions for the 5x5 grid (25 tiles total) - using 16x16 pixel tiles
  public static readonly TILES: { [key: string]: TileDefinition } = {
    // Row 0 (0-4): Base dirt variants
    BASE_DIRT_1: { id: 0, name: 'Base Dirt 1 (default)', solid: false },
    BASE_DIRT_2: { id: 1, name: 'Base Dirt 2 (variant)', solid: false },
    BASE_DIRT_3: { id: 2, name: 'Base Dirt 3 (variant)', solid: false },
    BASE_DIRT_CRACK: { id: 3, name: 'Base Dirt + Crack', solid: false },
    BASE_DIRT_BONE: { id: 4, name: 'Base Dirt + Bone', solid: false },

    // Row 1 (5-9): Edges and center variants
    TOP_EDGE: { id: 5, name: 'Top Edge', solid: false },
    BOTTOM_EDGE: { id: 6, name: 'Bottom Edge', solid: false },
    LEFT_EDGE: { id: 7, name: 'Left Edge', solid: false },
    RIGHT_EDGE: { id: 8, name: 'Right Edge', solid: false },
    CENTER_CRACKED: { id: 9, name: 'Center Cracked Variant', solid: false },

    // Row 2 (10-14): Corners and overlays
    TOP_LEFT_CORNER: { id: 10, name: 'Top-Left Corner', solid: false },
    TOP_RIGHT_CORNER: { id: 11, name: 'Top-Right Corner', solid: false },
    BOTTOM_LEFT_CORNER: { id: 12, name: 'Bottom-Left Corner', solid: false },
    BOTTOM_RIGHT_CORNER: { id: 13, name: 'Bottom-Right Corner', solid: false },
    ROCK_CLUSTER: { id: 14, name: 'Rock Cluster Overlay', solid: false },

    // Row 3 (15-19): Details and overlays
    BLOOD_SPLATTER: { id: 15, name: 'Blood Splatter', solid: false },
    BONE_OVERLAY: { id: 16, name: 'Bone Overlay 2', solid: false },
    MOSS_PATCH: { id: 17, name: 'Moss Patch', solid: false },
    DEAD_GRASS: { id: 18, name: 'Dead Grass', solid: false },
    SMALL_STONE: { id: 19, name: 'Small Stone Detail', solid: false },

    // Row 4 (20-24): Additional textures
    MUD_PATCH: { id: 20, name: 'Mud Patch', solid: false },
    STONE_MOSS: { id: 21, name: 'Stone + Moss', solid: false },
    GRAVEL_CLUSTER: { id: 22, name: 'Gravel Cluster', solid: false },
    SUBTLE_SHADOW: { id: 23, name: 'Overlay (Subtle Shadow)', solid: false },
    SEAMLESS_FILLER: { id: 24, name: 'Seamless Filler (Alt)', solid: false }
  };

  // Tile variants for natural variation - updated for new tileset
  public static readonly GROUND_VARIANTS = [0, 1, 2, 3, 4]; // Base dirt variants
  public static readonly DETAIL_VARIANTS = [15, 16, 17, 18, 19]; // Blood, bones, moss, grass, stones
  public static readonly TEXTURE_VARIANTS = [20, 21, 22, 23, 24]; // Mud, stone+moss, gravel, shadow, filler
  public static readonly EDGE_VARIANTS = [5, 6, 7, 8]; // Edge tiles
  public static readonly CORNER_VARIANTS = [10, 11, 12, 13]; // Corner tiles

  public static getTileDefinition(id: number): TileDefinition | null {
    for (const tile of Object.values(this.TILES)) {
      if (tile.id === id) return tile;
    }
    return null;
  }

  public static isSolid(tileId: number): boolean {
    const tile = this.getTileDefinition(tileId);
    return tile ? tile.solid : false;
  }
}
