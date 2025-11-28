# Vampire Survivors Clone

## Project Overview

A TypeScript-based survivor-style game built with React, Canvas API, and Express. Fight against endless waves of enemies using the mystical Sylph Blooms weapon system that spawns magical flower turrets.

**Last Updated**: November 28, 2024

## Current State

The project is fully configured and running in the Replit environment. The game features:
- Infinite survival gameplay with wave-based enemies
- Unique weapon systems including Sylph Blooms (flower turrets)
- Animated player character with directional movement
- Experience system with power-ups
- Procedurally generated tilemap

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Rendering**: Canvas 2D API
- **State Management**: Zustand
- **UI Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Port**: 5000 (configured for Replit proxy)

### Backend
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js (tsx for development)
- **Storage**: In-memory (MemStorage) - can be upgraded to PostgreSQL
- **Port**: 5000 (same server serves both API and frontend)

### Project Structure
```
├── client/                 # Frontend React application
│   ├── public/            # Static assets (sprites, sounds, tilesets)
│   └── src/
│       ├── components/    # React components
│       ├── lib/
│       │   ├── game/      # Game engine classes
│       │   └── stores/    # State management
│       └── pages/
├── server/                # Backend Express server
├── shared/                # Shared types and schemas
└── migrations/            # Database migrations (optional)
```

## Technology Stack

**Frontend**:
- React 18, Canvas API, Zustand, Tailwind CSS, Vite

**Backend**:
- Express.js, TypeScript, Drizzle ORM (optional)

**Game Engine**:
- Custom TypeScript engine with Canvas 2D rendering
- Delta time-based animations
- Collision detection system
- Particle effects

## Environment Setup

### Development
- **Workflow**: `npm run dev` (tsx server/index.ts)
- **Port**: 5000 (0.0.0.0 binding)
- **Hot Reload**: Vite HMR enabled
- **Host Configuration**: `allowedHosts: true` for Replit proxy

### Production
- **Build**: `npm run build` (Vite + esbuild bundle)
- **Deploy**: Autoscale deployment
- **Run**: `node dist/index.js`

## Database (Optional)

The app currently uses in-memory storage (`MemStorage`). To upgrade to PostgreSQL:
1. Create a PostgreSQL database in Replit
2. Update `server/storage.ts` to use Drizzle ORM
3. Run `npm run db:push` to apply schema
4. Requires `DATABASE_URL` environment variable

## Dependencies

Major packages:
- React ecosystem: react, react-dom, react-router-dom
- UI: @radix-ui components, Tailwind CSS
- Game libraries: Canvas API, Howler.js (audio)
- Backend: Express, TypeScript, tsx
- Build: Vite, esbuild, TypeScript

## Game Features

### Controls
- **Movement**: WASD or Arrow Keys
- **Sound**: M to toggle
- **Restart**: R key
- **Start**: Space or Click

### Weapon System
- Sylph Blooms: Spawns magical flower turrets
- Multiple weapon types available
- Auto-targeting and firing

### Enemy Types
- Basic: Standard speed/health
- Fast: Quick movement, low health
- Tank: Slow but high health/damage

## Deployment

Configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Run command: `node dist/index.js`
- Port: 5000 (auto-configured)

## Known Issues

- LSP warning in `server/vite.ts` about `allowedHosts` type (cosmetic only, code works correctly)
- Some npm packages have deprecation warnings (non-critical)

## User Preferences

- None documented yet

## Recent Changes (November 28, 2024)

1. Installed npm dependencies
2. Added missing `nanoid` package to package.json
3. Configured workflow for development server (port 5000, webview)
4. Configured deployment for autoscale
5. Verified frontend and backend are working correctly
6. Set up Replit environment with proper host configuration
