
# Vampire Survivors Clone

A TypeScript-based survivor-style game built with React, Canvas API, and Express. Fight against endless waves of enemies using the mystical Sylph Blooms weapon system that spawns magical flower turrets.

## 🎮 Game Features

- **Infinite Survival Gameplay**: Survive endless waves of increasingly difficult enemies
- **Unique Weapon System**: Sylph Blooms weapon that spawns magical flower turrets around the player
- **Animated Character**: Fully animated player character with directional movement sprites
- **Enemy Variety**: Multiple enemy types (Basic, Fast, Tank) with different behaviors
- **Experience System**: Collect experience orbs to level up and gain power-ups
- **Infinite World**: Procedurally generated tilemap with collision detection
- **Audio System**: Background music and sound effects
- **Power-Up System**: Upgrade damage, fire rate, flower capacity, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm

### Installation & Running

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the forwarded URL (typically port 5000)

## 🎯 How to Play

### Controls
- **WASD** or **Arrow Keys**: Move your character
- **M**: Toggle sound on/off
- **R**: Restart the game
- **Space** or **Click**: Start the game

### Gameplay
- Your character automatically fires the Sylph Blooms weapon
- Magical flower turrets spawn around you and shoot at nearby enemies
- Collect experience orbs dropped by defeated enemies
- Level up to choose from powerful upgrades
- Survive as long as possible against increasing waves

### Weapon System: Sylph Blooms
- Spawns magical flower turrets that persist for 15 seconds
- Flowers automatically target and shoot at nearby enemies
- Flowers have bloom stages that increase their damage over time
- Maximum of 4-6 flowers active at once (upgradeable)
- Flowers shoot magical orbs that home in on enemies

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   │   ├── textures/      # Game sprites and textures
│   │   ├── sounds/        # Audio files
│   │   └── Tileset/       # Tilemap assets
│   └── src/
│       ├── components/    # React components
│       ├── lib/
│       │   ├── game/      # Game engine classes
│       │   └── stores/    # State management
│       └── pages/
├── server/                # Backend Express server
├── shared/                # Shared types and schemas
└── migrations/            # Database migrations
```

### Key Game Classes

- **GameEngine**: Main game loop and system coordination
- **Player**: Character with animation, movement, and weapon systems
- **SylphBloomsWeapon**: Unique flower-spawning weapon system
- **InfiniteTileRenderer**: Procedural world generation with collision
- **WaveManager**: Enemy spawning and difficulty progression
- **SpriteManager**: Asset loading and management
- **AnimationManager**: Character animation system

## 🎨 Assets

The game uses pixel art assets including:
- Player character sprites with directional animations
- Enemy sprites (basic, fast, tank variants)
- Tileset for world generation
- Particle effects and UI elements

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: TypeScript type checking
- `npm run db:push`: Push database schema changes

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Canvas API for game rendering
- Zustand for state management
- Tailwind CSS for UI styling
- Vite for bundling

**Backend:**
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Session-based authentication
- WebSocket support

**Game Engine:**
- Custom TypeScript game engine
- Canvas 2D rendering
- Delta time-based animations
- Collision detection system
- Particle effects system

## 🎵 Audio

The game features:
- Background music during gameplay
- Sound effects for hits and interactions
- Mute/unmute functionality
- Howler.js for audio management

## 🗄️ Database

Uses PostgreSQL with Drizzle ORM for:
- User sessions
- Game statistics
- Leaderboards (if implemented)

Environment variable required:
- `DATABASE_URL`: PostgreSQL connection string

## 🚀 Deployment

The project is configured for deployment on Replit:
- Production build script included
- Database migrations supported
- Environment variables configured
- Port 5000 forwarding enabled

## 🎮 Game Mechanics

### Enemy Types
- **Basic**: Standard speed and health
- **Fast**: Quick movement, low health
- **Tank**: Slow but high health and damage

### Power-Up System
- **Damage**: Increase weapon damage
- **Fire Rate**: Reduce flower spawn interval
- **Flower Capacity**: Increase maximum flowers
- **Flower Lifespan**: Extend flower duration
- **Health**: Restore player health

### Collision System
- Player vs enemies
- Projectiles vs enemies
- Player vs experience orbs
- Tile-based world collision

## 🔮 Future Enhancements

- Additional weapon types
- Boss battles
- Multiplayer support
- Achievement system
- Save/load functionality
- Mobile touch controls

## 📝 License

This project is available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Game won't start:**
- Check browser console for errors
- Ensure all assets are loading properly
- Verify database connection

**Performance issues:**
- Reduce particle count in development mode
- Check for memory leaks in game loops
- Monitor FPS counter in debug mode

**Audio not working:**
- Check browser autoplay policies
- Verify audio files are accessible
- Test mute/unmute functionality

For more help, check the browser console for detailed error messages.
