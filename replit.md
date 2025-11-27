# Vampire Survivors Clone

## Overview

A TypeScript-based browser game inspired by Vampire Survivors, featuring survival gameplay with infinite enemy waves, character progression, and weapon systems. Built with React for UI, HTML5 Canvas for rendering, and Express for the backend server. The game includes two playable characters (Sylph Guardian and Shadow Assassin), each with unique weapon mechanics, a boss system, persistent progression, and extensive power-up systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for UI components and state management
- HTML5 Canvas API for game rendering
- Vite as build tool and development server
- TailwindCSS with Radix UI components for styling
- React Query for data fetching and caching

**Game Engine Design:**
- Custom game loop using `requestAnimationFrame` for 60 FPS rendering
- Entity-Component pattern for game objects (Player, Enemies, Projectiles, Collectibles)
- Separation of rendering logic from game logic
- Canvas-based 2D rendering with sprite animation support
- Tile-based world generation for infinite scrolling

**State Management:**
- Zustand stores for global game state (`useGameState`) and audio (`useAudio`)
- Component-local state for UI interactions
- Game engine maintains its own state separate from React

**Key Architectural Decisions:**
- **Dual Rendering Approach**: Game uses Canvas for performance-critical rendering while UI overlays use React components. This separates concerns and allows smooth 60 FPS game rendering independent of React's reconciliation.
- **Character System**: Two distinct character classes with different weapon mechanics. Sylph uses turret-based "Sylph Blooms" while Assassin uses mobile "Spider Swarm". Chose composition pattern to allow shared behaviors while maintaining character-specific mechanics.
- **Procedural World**: Infinite tilemap generation allows endless gameplay without memory constraints. Uses chunk-based loading/unloading strategy.

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Vite middleware for development with HMR
- Session-based architecture (infrastructure present but minimal game data stored server-side)

**API Design:**
- RESTful endpoints under `/api` prefix
- Minimal backend logic - game runs primarily client-side
- Server serves static assets in production

**Key Decisions:**
- **Client-First Architecture**: Game logic runs entirely in browser for responsiveness. Server is primarily static file server with potential for leaderboards/persistence later.
- **Development vs Production**: Uses Vite dev server in development for HMR, static serving in production for performance.

### Data Storage

**Database:**
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts` with users table
- Database currently unused but infrastructure ready for:
  - User accounts and authentication
  - Persistent save data
  - Leaderboards
  - Achievement tracking

**Local Storage:**
- Browser localStorage for client-side persistence
- SaveSystem for game progress
- PersistentProgressionSystem for permanent upgrades
- StatisticsSystem for player metrics

**Key Decisions:**
- **Dual Storage Strategy**: localStorage for immediate persistence without server dependency, database infrastructure ready for multi-device sync and leaderboards. This allows offline play while enabling future online features.
- **In-Memory Fallback**: MemStorage implementation allows development without database provisioning.

### Game Systems

**Core Systems:**
- **Combat System**: Automatic weapon firing, collision detection, damage calculation
- **Experience/Leveling**: XP collection, level-up power-up selection
- **Wave System**: Progressive difficulty scaling, boss spawns every 5 waves
- **Combo System**: Time-based kill chains with damage multipliers
- **Achievement System**: Unlockable achievements with notification UI
- **Persistent Progression**: Currency-based permanent upgrades between runs

**Power-Up System:**
- Character-specific and universal upgrades
- Applied through functional composition pattern
- Upgrades modify player stats, weapon behavior, or add new mechanics

**Audio System:**
- Zustand-based audio state management
- Placeholder architecture for background music and sound effects
- Volume controls and mute functionality

**Key Decisions:**
- **Power-Up Composition**: Power-ups as pure functions that modify player state. Allows flexible combination of upgrades without complex inheritance hierarchies.
- **Boss Wave Pattern**: Regular boss intervals (every 5 waves) create rhythm and progression milestones. Warning system builds anticipation.
- **Persistent Progression**: Meta-game currency system provides long-term goals beyond individual runs, increasing replay value.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Comprehensive accessible component primitives (accordions, dialogs, dropdowns, tooltips, etc.)
- **TailwindCSS**: Utility-first CSS framework with custom theme configuration
- **class-variance-authority**: Type-safe component variants
- **Lucide React**: Icon library

### Build & Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Type safety across client and server
- **ESBuild**: Fast TypeScript/JavaScript bundler
- **PostCSS/Autoprefixer**: CSS processing

### Data & State Management
- **Zustand**: Lightweight state management (game state, audio)
- **React Query (TanStack Query)**: Server state management and caching
- **Drizzle ORM**: Type-safe SQL database toolkit
- **Zod**: Schema validation

### Database
- **Neon Database (@neondatabase/serverless)**: Serverless PostgreSQL
- **PostgreSQL dialect** for Drizzle

### React Ecosystem
- **React 18**: UI framework
- **React Router**: Client-side routing
- **React Day Picker**: Date selection components

### Specialized Libraries
- **@react-three/fiber**: React renderer for Three.js (3D graphics capability)
- **@react-three/drei**: Useful helpers for Three.js
- **@react-three/postprocessing**: Post-processing effects for 3D
- **vite-plugin-glsl**: GLSL shader support in Vite
- **nanoid**: Unique ID generation
- **date-fns**: Date manipulation utilities

### Session Management
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **tsx**: TypeScript execution for Node.js
- **concurrently**: Run multiple commands (for VSCode setup)
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for Replit environment

**Key Integration Decisions:**
- **Database Choice**: Neon serverless PostgreSQL chosen for scalability and Replit compatibility, though currently used minimally.
- **3D Capability**: Three.js integration present but unused in current game implementation. Indicates potential for future 3D features or effects.
- **Radix UI**: Chosen for accessibility and headless component approach, allowing custom styling with TailwindCSS.