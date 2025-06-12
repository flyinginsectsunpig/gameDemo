
export const TileConfig = {
  TILE_SIZE: 32,
  CHUNK_SIZE: 32,
  TILES_PER_ROW: 5,
  SRC_TILE_SIZE: 16,
  
  // Rendering optimization
  RENDER_BUFFER: 2, // Extra tiles to render outside viewport
  CHUNK_CLEANUP_DISTANCE: 3, // Distance in chunks before cleanup
  
  // Generation probabilities (0-100)
  GENERATION: {
    GROUND_THRESHOLD: 60,
    DECORATION_THRESHOLD: 70,
    VEGETATION_THRESHOLD: 75,
    STRUCTURE_THRESHOLD: 85,
    STRUCTURE_DENSITY: 5, // Percentage chance for structures in valid areas
  },
  
  // Camera settings
  CAMERA: {
    FOLLOW_SPEED: 0.1,
    SMOOTHING: true,
  },
  
  // Collision settings
  COLLISION: {
    PLAYER_MARGIN: 2, // Pixels of margin to prevent getting stuck
  },
  
  // Sprite paths
  SPRITES: {
    UNDEAD_TILESET: '/craftpix-net-695666-free-undead-tileset-top-down-pixel-art/PNG/Ground_rocks.png'
  }
};
