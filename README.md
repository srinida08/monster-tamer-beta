# MiMo Monster Tamer

> A pixel-art monster taming RPG built for the [100T MiMo Challenge](https://100t.xiaomimimo.com/)

**Beta 1.0.0** | [Play Now](https://pixel-monster-game-6a6n4gki.devinapps.com)

## Features

### World Exploration
- Expansive 80x56 tile world map with 10 unique zones: Meadows, Dark Forest, Crystal Shores, Volcano, Desert, Mountain Ruins, and more
- Pixel art terrain with animated tiles (water, lava, flowers)
- Town center with Heal Center, Shop, Bag, and Collection buildings

### Monster System
- 35 unique pixel-art monster sprites (5 per element, 7 elements)
- 7 elements: Fire, Water, Earth, Wind, Lightning, Shadow, Light
- 5 rarity tiers: Common, Uncommon, Rare, Epic, Legendary
- AI-powered monster generation via MiMo API (optional)
- Fallback template system works without API key

### Visual Battle System
- Animated monster sprites with idle animations
- Attack particles and slash effects
- Damage numbers and HP bar animations
- Skill-based combat with elemental advantages
- Monster capture mechanics with capture balls

### NPC Duel System
- 6 unique NPC trainers with different outfit colors:
  - **Blade Master Kai** (Warrior/Red) - Inferno Beast (Fire, Lv.3)
  - **Sage Elara** (Mage/Purple) - Crystal Serpent (Water, Lv.5)
  - **Ranger Finn** (Ranger/Green) - Thornbeast (Earth, Lv.4)
  - **Master Zhen** (Monk/Yellow) - Thunder Hawk (Lightning, Lv.7)
  - **Witch Morgana** (Witch/Dark) - Shadow Wraith (Shadow, Lv.8)
  - **Knight Captain Sol** (Knight/Gray) - Lava Golem (Fire, Lv.9)
- NPCs spawn at random positions across different zones
- Pop-up chat dialog with multi-step conversations
- Accept or decline duel challenges
- Bonus XP and gold rewards for NPC victories
- Defeated NPC tracking (persistent)

### Inventory & Shop
- 4 item categories: Potions, Balls, Boosts, Keys
- 11 different items to collect and use
- Buy and sell items at the shop
- Quick shop accessible from the map

### Collection
- View all captured monsters
- Set active battle monster
- Monster details with stats and skills

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| E / Space | Talk to NPC |
| B | Open Bag/Inventory |
| C | Open Collection |

Mobile: D-pad and quick-action buttons on screen

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + Custom pixel art CSS
- **Rendering**: HTML5 Canvas (all sprites rendered programmatically)
- **AI Integration**: MiMo API (`https://api.xiaomimimo.com/v1/chat/completions`)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### MiMo API Key (Optional)

The game works without an API key using the built-in fallback monster generator. To enable AI-powered monster generation:

1. Get your API key from [100T MiMo](https://100t.xiaomimimo.com/)
2. Enter it on the landing page (format: `tp-...`)

## Project Structure

```
src/
  App.tsx        # Main game components (GameMap, BattleScene, NPC Dialog, etc.)
  App.css        # Pixel art styles and animations
  types.ts       # TypeScript interfaces (Monster, Player, NPC, etc.)
  worldMap.ts    # World map generation, tile rendering, NPC system
  sprites.ts     # Monster sprite rendering and battle effects
  items.ts       # Item definitions and shop data
  main.tsx       # Entry point
```

## License

Built for the [100T MiMo Challenge](https://100t.xiaomimimo.com/)
