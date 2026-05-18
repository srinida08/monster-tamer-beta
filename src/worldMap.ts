import { Element, ZoneInfo, NpcDef } from './types'

export const T = {
  GRASS: 0, PATH: 1, TALL_GRASS: 2, WATER: 3, TREE: 4, WALL: 5,
  HEAL_DOOR: 6, COLLECT_DOOR: 7, SHOP_DOOR: 8, SAND: 9, DARK_GRASS: 10,
  VOLC_GRASS: 11, CRYST_GRASS: 12, ROCK: 13, FLOWERS: 14, SIGN: 15,
  SWAMP: 16, DESERT: 17, MOUNTAIN: 18, RUINS: 19, BRIDGE: 20,
  NPC_HOUSE: 21, BAG_DOOR: 22, LAVA: 23, ICE: 24, MUSHROOM: 25,
}

export const IMPASSABLE = new Set([T.WATER, T.TREE, T.WALL, T.ROCK, T.LAVA, T.ICE])
export const ENCOUNTER_TILES = new Set([T.TALL_GRASS, T.DARK_GRASS, T.VOLC_GRASS, T.CRYST_GRASS, T.SWAMP, T.DESERT, T.MOUNTAIN, T.RUINS])

export const MW = 80, MH = 56, TS = 32
export const TCX = 40, TCY = 28 // Town center

export const ZONES: Record<string, ZoneInfo> = {
  town:    { name: '\uD83C\uDFD8\uFE0F Monster Town',     elements: [],                   minLevel: 0, color: '#888',    bgGradient: ['#1a1a2a', '#2a2a4a'] },
  meadow:  { name: '\uD83C\uDF3F Emerald Meadows',  elements: ['earth', 'wind'],     minLevel: 1, color: '#44bb44', bgGradient: ['#1a2a0a', '#2a4a1a'] },
  forest:  { name: '\uD83C\uDF11 Shadow Forest',    elements: ['shadow', 'fire'],    minLevel: 3, color: '#9944ff', bgGradient: ['#0a0515', '#1a0a2a'] },
  crystal: { name: '\uD83D\uDC8E Crystal Shores',   elements: ['water', 'light'],    minLevel: 5, color: '#44aaff', bgGradient: ['#0a1a3a', '#1a4466'] },
  volcano: { name: '\uD83C\uDF0B Inferno Peaks',    elements: ['fire', 'lightning'],  minLevel: 7, color: '#ff4444', bgGradient: ['#1a0505', '#4a1500'] },
  swamp:   { name: '\uD83E\uDEB9 Murky Swamp',      elements: ['water', 'shadow'],   minLevel: 4, color: '#448844', bgGradient: ['#0a1a0a', '#1a2a1a'] },
  desert:  { name: '\uD83C\uDFDC\uFE0F Scorched Desert',  elements: ['earth', 'fire'],     minLevel: 4, color: '#ccaa44', bgGradient: ['#2a1a05', '#4a3a1a'] },
  mountain:{ name: '\u26F0\uFE0F Storm Summit',     elements: ['wind', 'lightning'],  minLevel: 6, color: '#8888cc', bgGradient: ['#1a1a2a', '#2a3a5a'] },
  ruins:   { name: '\uD83C\uDFDB\uFE0F Ancient Ruins',    elements: ['shadow', 'light'],   minLevel: 8, color: '#aa88cc', bgGradient: ['#1a1020', '#2a1a3a'] },
  wild:    { name: '\uD83D\uDDFA\uFE0F Wilderness',       elements: ['earth', 'wind'],     minLevel: 1, color: '#66aa44', bgGradient: ['#1a2a0a', '#2a4a1a'] },
}

export function getZoneAt(x: number, y: number): string {
  // Town center
  if (x >= 34 && x <= 47 && y >= 22 && y <= 34) return 'town'
  // Meadow - west
  if (x < 30 && y >= 16 && y <= 40) return 'meadow'
  // Forest - east
  if (x > 50 && y >= 12 && y <= 44) return 'forest'
  // Crystal shores - north
  if (y < 16 && x >= 20 && x <= 60) return 'crystal'
  // Volcano - south
  if (y > 40 && x >= 20 && x <= 60) return 'volcano'
  // Swamp - southwest
  if (x < 25 && y > 38) return 'swamp'
  // Desert - southeast
  if (x > 55 && y > 38) return 'desert'
  // Mountain - northwest
  if (x < 25 && y < 18) return 'mountain'
  // Ruins - northeast
  if (x > 55 && y < 18) return 'ruins'
  return 'wild'
}

export function getEncounterElements(tile: number): Element[] {
  switch (tile) {
    case T.TALL_GRASS: return ['earth', 'wind']
    case T.DARK_GRASS: return ['shadow', 'fire']
    case T.VOLC_GRASS: return ['fire', 'lightning']
    case T.CRYST_GRASS: return ['water', 'light']
    case T.SWAMP: return ['water', 'shadow']
    case T.DESERT: return ['earth', 'fire']
    case T.MOUNTAIN: return ['wind', 'lightning']
    case T.RUINS: return ['shadow', 'light']
    default: return ['earth', 'wind']
  }
}

export function getEncounterLevel(x: number, y: number): number {
  return Math.max(1, Math.floor(Math.sqrt((x - TCX) ** 2 + (y - TCY) ** 2) / 6))
}

export const TC: Record<number, string> = {
  [T.GRASS]: '#4a8c3f',
  [T.PATH]: '#c8a870',
  [T.TALL_GRASS]: '#2d6b22',
  [T.WATER]: '#2244aa',
  [T.TREE]: '#1a5c1a',
  [T.WALL]: '#666680',
  [T.HEAL_DOOR]: '#cc3333',
  [T.COLLECT_DOOR]: '#3366cc',
  [T.SHOP_DOOR]: '#ccaa33',
  [T.SAND]: '#d4c090',
  [T.DARK_GRASS]: '#3a2a5c',
  [T.VOLC_GRASS]: '#6b3322',
  [T.CRYST_GRASS]: '#2a6666',
  [T.ROCK]: '#555566',
  [T.FLOWERS]: '#4a8c3f',
  [T.SIGN]: '#c8a870',
  [T.SWAMP]: '#2a4a2a',
  [T.DESERT]: '#c4a050',
  [T.MOUNTAIN]: '#7788aa',
  [T.RUINS]: '#5a4a6a',
  [T.BRIDGE]: '#8b6914',
  [T.NPC_HOUSE]: '#666680',
  [T.BAG_DOOR]: '#886633',
  [T.LAVA]: '#cc3300',
  [T.ICE]: '#aaddff',
  [T.MUSHROOM]: '#4a8c3f',
}

export function createWorldMap(): number[][] {
  const m: number[][] = Array.from({ length: MH }, () => Array(MW).fill(T.WATER))
  const s = (x: number, y: number, t: number) => {
    if (x >= 0 && x < MW && y >= 0 && y < MH) m[y][x] = t
  }
  const r = (x1: number, y1: number, w: number, h: number, t: number) => {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) s(x1 + dx, y1 + dy, t)
  }

  // Main island shape - large elliptical landmass
  for (let y = 3; y < MH - 3; y++) {
    for (let x = 3; x < MW - 3; x++) {
      const nx = (x - TCX) / 36
      const ny = (y - TCY) / 24
      const dist = nx * nx + ny * ny + Math.sin(x * 0.3) * 0.03 + Math.cos(y * 0.4) * 0.03
      if (dist < 0.92) m[y][x] = T.GRASS
    }
  }

  // ===== TOWN (center) =====
  r(34, 22, 14, 13, T.GRASS)

  // Town buildings
  // Heal center (red cross)
  r(36, 22, 5, 3, T.WALL); s(38, 24, T.HEAL_DOOR)
  // Shop
  r(42, 22, 5, 3, T.WALL); s(44, 24, T.SHOP_DOOR)
  // Collection hall
  r(36, 30, 5, 3, T.WALL); s(38, 30, T.COLLECT_DOOR)
  // Bag storage
  r(42, 30, 5, 3, T.WALL); s(44, 30, T.BAG_DOOR)

  // Town paths - main cross
  for (let x = 32; x < 50; x++) s(x, 27, T.PATH)
  for (let y = 20; y < 36; y++) s(40, y, T.PATH)
  // Secondary paths
  for (let x = 34; x < 48; x++) { s(x, 25, T.PATH); s(x, 31, T.PATH) }
  for (let y = 22; y < 34; y++) { s(37, y, T.PATH); s(43, y, T.PATH) }
  s(40, 27, T.PATH) // center crossroads

  // Town decorations
  s(35, 26, T.FLOWERS); s(41, 26, T.FLOWERS); s(46, 26, T.FLOWERS)
  s(35, 29, T.FLOWERS); s(41, 29, T.FLOWERS); s(46, 29, T.FLOWERS)
  s(39, 26, T.SIGN); s(41, 28, T.SIGN)

  // Town trees along edges
  for (let x = 33; x < 49; x++) {
    if (x % 3 === 0) { s(x, 21, T.TREE); s(x, 34, T.TREE) }
  }

  // ===== MAIN ROADS out of town =====
  // West road
  for (let x = 10; x < 34; x++) s(x, 27, T.PATH)
  // East road
  for (let x = 48; x < 70; x++) s(x, 27, T.PATH)
  // North road
  for (let y = 6; y < 22; y++) s(40, y, T.PATH)
  // South road
  for (let y = 34; y < 50; y++) s(40, y, T.PATH)
  // Diagonal roads
  // NW path
  for (let i = 0; i < 18; i++) { s(32 - i, 22 - i, T.PATH); if (i % 2 === 0) s(33 - i, 22 - i, T.PATH) }
  // NE path
  for (let i = 0; i < 18; i++) { s(48 + i, 22 - i, T.PATH); if (i % 2 === 0) s(47 + i, 22 - i, T.PATH) }
  // SW path
  for (let i = 0; i < 18; i++) { s(32 - i, 34 + i, T.PATH); if (i % 2 === 0) s(33 - i, 34 + i, T.PATH) }
  // SE path
  for (let i = 0; i < 18; i++) { s(48 + i, 34 + i, T.PATH); if (i % 2 === 0) s(47 + i, 34 + i, T.PATH) }

  // ===== MEADOW (west) =====
  for (let y = 16; y < 40; y++) {
    for (let x = 6; x < 30; x++) {
      if (m[y][x] === T.GRASS) {
        if ((x * 7 + y * 3) % 10 < 2) m[y][x] = T.TREE
        else if ((x + y) % 5 < 3) m[y][x] = T.TALL_GRASS
        else if ((x * 3 + y * 7) % 20 === 0) m[y][x] = T.FLOWERS
      }
    }
  }
  // Keep paths clear
  for (let x = 10; x < 34; x++) s(x, 27, T.PATH)

  // ===== DARK FOREST (east) =====
  for (let y = 12; y < 44; y++) {
    for (let x = 52; x < 74; x++) {
      if (m[y][x] === T.GRASS) {
        if ((x * 7 + y * 13) % 10 < 3) m[y][x] = T.TREE
        else m[y][x] = T.DARK_GRASS
      }
    }
  }
  // Forest clearings
  r(58, 20, 4, 4, T.DARK_GRASS); r(62, 30, 4, 4, T.DARK_GRASS); r(56, 38, 4, 3, T.DARK_GRASS)
  // Keep paths clear
  for (let x = 48; x < 70; x++) s(x, 27, T.PATH)
  // Add mushrooms in forest
  for (let y = 14; y < 42; y += 5) {
    for (let x = 54; x < 72; x += 6) {
      if (m[y][x] === T.DARK_GRASS) s(x, y, T.MUSHROOM)
    }
  }

  // ===== CRYSTAL SHORES (north) =====
  for (let y = 4; y < 16; y++) {
    for (let x = 20; x < 60; x++) {
      if (m[y][x] === T.GRASS) {
        if (y <= 6) m[y][x] = T.SAND
        else if (y <= 8) m[y][x] = (x + y) % 3 === 0 ? T.SAND : T.CRYST_GRASS
        else m[y][x] = T.CRYST_GRASS
      }
    }
  }
  // Ice patches
  for (let i = 0; i < 5; i++) {
    const ix = 25 + i * 7, iy = 6 + (i % 3)
    s(ix, iy, T.ICE); s(ix + 1, iy, T.ICE)
  }
  // Keep path
  for (let y = 6; y < 22; y++) s(40, y, T.PATH)

  // ===== VOLCANO (south) =====
  for (let y = 40; y < 52; y++) {
    for (let x = 20; x < 60; x++) {
      if (m[y][x] === T.GRASS) {
        if ((x * 11 + y * 7) % 10 < 2) m[y][x] = T.ROCK
        else m[y][x] = T.VOLC_GRASS
      }
    }
  }
  // Lava pools
  for (let i = 0; i < 6; i++) {
    const lx = 25 + i * 6, ly = 43 + (i % 3) * 2
    s(lx, ly, T.LAVA); s(lx + 1, ly, T.LAVA)
  }
  // Keep path
  for (let y = 34; y < 50; y++) s(40, y, T.PATH)

  // ===== SWAMP (southwest) =====
  for (let y = 38; y < 52; y++) {
    for (let x = 6; x < 25; x++) {
      if (m[y][x] === T.GRASS || m[y][x] === T.TALL_GRASS) {
        if ((x + y * 3) % 7 === 0) m[y][x] = T.WATER
        else m[y][x] = T.SWAMP
      }
    }
  }
  // Swamp bridges
  for (let i = 0; i < 3; i++) {
    const bx = 10 + i * 5, by = 42 + i * 2
    s(bx, by, T.BRIDGE); s(bx + 1, by, T.BRIDGE)
  }

  // ===== DESERT (southeast) =====
  for (let y = 38; y < 52; y++) {
    for (let x = 56; x < 74; x++) {
      if (m[y][x] === T.GRASS || m[y][x] === T.DARK_GRASS) {
        if ((x * 5 + y * 3) % 12 < 2) m[y][x] = T.ROCK
        else m[y][x] = T.DESERT
      }
    }
  }
  // Desert oasis
  r(62, 44, 3, 3, T.WATER); s(63, 43, T.FLOWERS); s(64, 43, T.FLOWERS)

  // ===== MOUNTAIN (northwest) =====
  for (let y = 4; y < 18; y++) {
    for (let x = 6; x < 25; x++) {
      if (m[y][x] === T.GRASS) {
        if ((x + y) % 4 === 0) m[y][x] = T.ROCK
        else m[y][x] = T.MOUNTAIN
      }
    }
  }

  // ===== RUINS (northeast) =====
  for (let y = 4; y < 18; y++) {
    for (let x = 56; x < 74; x++) {
      if (m[y][x] === T.GRASS || m[y][x] === T.CRYST_GRASS) {
        if ((x * 3 + y * 7) % 8 < 2) m[y][x] = T.WALL
        else m[y][x] = T.RUINS
      }
    }
  }
  // Ruins clearings
  r(60, 8, 5, 5, T.RUINS); r(66, 12, 4, 4, T.RUINS)

  // ===== WATER FEATURES =====
  // River from crystal shores through town east side
  for (let y = 4; y < 50; y++) {
    const rx = 50 + Math.floor(Math.sin(y * 0.3) * 2)
    if (y < 20 || y > 35) { s(rx, y, T.WATER); s(rx + 1, y, T.WATER) }
  }
  // Lake in meadow
  r(12, 24, 4, 3, T.WATER)
  // Pond near volcano
  r(30, 46, 3, 2, T.WATER)

  // ===== BRIDGES over rivers =====
  s(50, 20, T.BRIDGE); s(51, 20, T.BRIDGE)
  s(50, 35, T.BRIDGE); s(51, 35, T.BRIDGE)

  return m
}

export const WORLD_MAP = createWorldMap()

export function drawTile(ctx: CanvasRenderingContext2D, sx: number, sy: number, s: number, tile: number, time: number) {
  ctx.fillStyle = TC[tile] || '#333'
  ctx.fillRect(sx, sy, s, s)

  switch (tile) {
    case T.GRASS:
      ctx.fillStyle = '#55994a'
      ctx.fillRect(sx + 6, sy + 10, 2, 8)
      ctx.fillRect(sx + 20, sy + 6, 2, 10)
      break

    case T.TALL_GRASS: {
      ctx.fillStyle = '#1d5b12'
      for (let i = 0; i < 5; i++) {
        const gx = sx + 2 + i * 6
        const sw = Math.sin(time * 0.002 + i + sx) * 2
        ctx.fillRect(gx + sw, sy + 2, 2, 14)
        ctx.fillRect(gx - 2 + sw, sy, 2, 6)
        ctx.fillRect(gx + 2 + sw, sy + 1, 2, 5)
      }
      break
    }

    case T.WATER: {
      ctx.fillStyle = '#3355bb'
      const wo = Math.sin(time * 0.003 + sx * 0.1) * 2
      ctx.fillRect(sx + 4, sy + 10 + wo, 12, 2)
      ctx.fillRect(sx + 18, sy + 20 - wo, 10, 2)
      break
    }

    case T.TREE:
      ctx.fillStyle = '#5c3a1a'
      ctx.fillRect(sx + 13, sy + 18, 6, 14)
      ctx.fillStyle = '#1a7c1a'
      ctx.fillRect(sx + 6, sy + 4, 20, 16)
      ctx.fillStyle = '#22882a'
      ctx.fillRect(sx + 8, sy + 2, 16, 8)
      ctx.fillStyle = '#2a9932'
      ctx.fillRect(sx + 10, sy + 6, 6, 4)
      break

    case T.WALL:
      ctx.fillStyle = '#777790'
      ctx.fillRect(sx, sy, s, 2)
      ctx.fillRect(sx, sy, 2, s)
      ctx.fillStyle = '#555568'
      ctx.fillRect(sx + s - 2, sy, 2, s)
      ctx.fillRect(sx, sy + s - 2, s, 2)
      break

    case T.HEAL_DOOR:
      ctx.fillStyle = '#884422'
      ctx.fillRect(sx + 4, sy + 4, s - 8, s - 4)
      ctx.fillStyle = '#ff4444'
      ctx.fillRect(sx + 13, sy + 8, 6, 16)
      ctx.fillRect(sx + 10, sy + 12, 12, 6)
      break

    case T.COLLECT_DOOR:
      ctx.fillStyle = '#884422'
      ctx.fillRect(sx + 4, sy + 4, s - 8, s - 4)
      ctx.fillStyle = '#4488ff'
      ctx.fillRect(sx + 10, sy + 10, 12, 12)
      ctx.fillStyle = '#fff'
      ctx.fillRect(sx + 14, sy + 14, 4, 4)
      break

    case T.SHOP_DOOR:
      ctx.fillStyle = '#884422'
      ctx.fillRect(sx + 4, sy + 4, s - 8, s - 4)
      ctx.fillStyle = '#ffcc00'
      ctx.fillRect(sx + 11, sy + 9, 10, 10)
      ctx.fillStyle = '#aa8800'
      ctx.fillRect(sx + 13, sy + 11, 6, 6)
      break

    case T.BAG_DOOR:
      ctx.fillStyle = '#884422'
      ctx.fillRect(sx + 4, sy + 4, s - 8, s - 4)
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(sx + 10, sy + 8, 12, 14)
      ctx.fillStyle = '#a0781e'
      ctx.fillRect(sx + 12, sy + 6, 8, 4)
      break

    case T.DARK_GRASS: {
      ctx.fillStyle = '#2a1a4a'
      for (let i = 0; i < 4; i++) {
        const gx = sx + 3 + i * 7
        const sw = Math.sin(time * 0.0015 + i + sy) * 1.5
        ctx.fillRect(gx + sw, sy + 4, 2, 12)
        ctx.fillRect(gx - 2 + sw, sy + 2, 2, 5)
      }
      ctx.globalAlpha = 0.27
      ctx.fillStyle = '#6633aa'
      ctx.fillRect(sx, sy, s, s)
      ctx.globalAlpha = 1
      break
    }

    case T.VOLC_GRASS:
      ctx.fillStyle = '#8b2200'
      ctx.fillRect(sx + 4, sy + 14, 8, 4)
      ctx.fillRect(sx + 18, sy + 8, 6, 4)
      ctx.globalAlpha = 0.27
      ctx.fillStyle = '#ff4400'
      ctx.fillRect(sx, sy, s, s)
      ctx.globalAlpha = 1
      if (Math.sin(time * 0.005 + sx + sy) > 0.7) {
        ctx.fillStyle = '#ff6600'
        ctx.fillRect(sx + 12, sy + 4, 4, 4)
      }
      break

    case T.CRYST_GRASS:
      ctx.fillStyle = '#1a5555'
      ctx.fillRect(sx + 6, sy + 10, 2, 10)
      ctx.fillRect(sx + 22, sy + 6, 2, 12)
      ctx.globalAlpha = 0.2
      ctx.fillStyle = '#66ffff'
      ctx.fillRect(sx, sy, s, s)
      ctx.globalAlpha = 1
      if (Math.sin(time * 0.004 + sx * 0.2 + sy * 0.3) > 0.5) {
        ctx.fillStyle = '#aaffff'
        ctx.fillRect(sx + 14, sy + 6, 3, 3)
      }
      break

    case T.ROCK:
      ctx.fillStyle = '#666677'
      ctx.fillRect(sx + 4, sy + 8, 24, 20)
      ctx.fillStyle = '#777788'
      ctx.fillRect(sx + 6, sy + 6, 20, 8)
      ctx.fillStyle = '#888899'
      ctx.fillRect(sx + 8, sy + 8, 6, 4)
      break

    case T.FLOWERS:
      ctx.fillStyle = '#55994a'
      ctx.fillRect(sx + 6, sy + 10, 2, 8)
      ctx.fillRect(sx + 20, sy + 6, 2, 10)
      ctx.fillStyle = '#ff6688'
      ctx.fillRect(sx + 4, sy + 6, 6, 6)
      ctx.fillStyle = '#ffcc44'
      ctx.fillRect(sx + 18, sy + 2, 6, 6)
      ctx.fillStyle = '#aa66ff'
      ctx.fillRect(sx + 12, sy + 14, 6, 6)
      break

    case T.SIGN:
      ctx.fillStyle = '#8B6914'
      ctx.fillRect(sx + 14, sy + 14, 4, 14)
      ctx.fillRect(sx + 8, sy + 6, 16, 10)
      ctx.fillStyle = '#A0781E'
      ctx.fillRect(sx + 10, sy + 8, 12, 6)
      break

    case T.SAND:
      ctx.fillStyle = '#c8b080'
      ctx.fillRect(sx + 8, sy + 12, 4, 4)
      ctx.fillRect(sx + 22, sy + 20, 4, 4)
      break

    case T.SWAMP: {
      ctx.fillStyle = '#1a3a1a'
      for (let i = 0; i < 3; i++) {
        const gx = sx + 4 + i * 9
        const sw = Math.sin(time * 0.001 + i + sx) * 1
        ctx.fillRect(gx + sw, sy + 6, 3, 10)
      }
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#336633'
      ctx.fillRect(sx, sy, s, s)
      ctx.globalAlpha = 1
      // Bubbles
      if (Math.sin(time * 0.003 + sx * 0.5 + sy * 0.7) > 0.8) {
        ctx.fillStyle = '#44aa44'
        ctx.fillRect(sx + 14, sy + 8, 4, 4)
      }
      break
    }

    case T.DESERT:
      ctx.fillStyle = '#b89040'
      ctx.fillRect(sx + 6, sy + 14, 8, 4)
      ctx.fillRect(sx + 20, sy + 8, 6, 4)
      // Sand ripples
      ctx.fillStyle = '#d4b060'
      ctx.fillRect(sx + 4, sy + 22, 24, 2)
      ctx.fillRect(sx + 8, sy + 10, 16, 2)
      break

    case T.MOUNTAIN:
      ctx.fillStyle = '#8899bb'
      ctx.fillRect(sx + 8, sy + 8, 16, 20)
      ctx.fillStyle = '#99aabb'
      ctx.fillRect(sx + 10, sy + 4, 12, 8)
      ctx.fillStyle = '#aabbcc'
      ctx.fillRect(sx + 12, sy + 2, 8, 4)
      // Snow cap
      ctx.fillStyle = '#ddeeff'
      ctx.fillRect(sx + 13, sy + 2, 6, 3)
      break

    case T.RUINS:
      ctx.fillStyle = '#4a3a5a'
      ctx.fillRect(sx + 4, sy + 10, 6, 18)
      ctx.fillRect(sx + 20, sy + 6, 6, 22)
      ctx.fillStyle = '#5a4a6a'
      ctx.fillRect(sx + 4, sy + 8, 22, 4)
      // Glow
      ctx.globalAlpha = 0.15
      ctx.fillStyle = '#aa66ff'
      ctx.fillRect(sx, sy, s, s)
      ctx.globalAlpha = 1
      break

    case T.BRIDGE:
      ctx.fillStyle = '#8B6914'
      ctx.fillRect(sx, sy, s, s)
      ctx.fillStyle = '#A0781E'
      ctx.fillRect(sx + 2, sy + 2, s - 4, s - 4)
      ctx.fillStyle = '#8B6914'
      ctx.fillRect(sx + s / 2 - 1, sy, 2, s)
      break

    case T.LAVA: {
      ctx.fillStyle = '#cc2200'
      ctx.fillRect(sx, sy, s, s)
      const lo = Math.sin(time * 0.004 + sx * 0.2) * 2
      ctx.fillStyle = '#ff4400'
      ctx.fillRect(sx + 4, sy + 6 + lo, 10, 6)
      ctx.fillStyle = '#ffaa00'
      ctx.fillRect(sx + 14, sy + 14 - lo, 8, 4)
      ctx.fillStyle = '#ffcc00'
      ctx.fillRect(sx + 8, sy + 10, 4, 4)
      break
    }

    case T.ICE:
      ctx.fillStyle = '#cceeFF'
      ctx.fillRect(sx, sy, s, s)
      ctx.fillStyle = '#ddf4ff'
      ctx.fillRect(sx + 4, sy + 4, 10, 10)
      ctx.fillStyle = '#eef8ff'
      ctx.fillRect(sx + 8, sy + 8, 4, 4)
      break

    case T.MUSHROOM:
      ctx.fillStyle = '#55994a'
      ctx.fillRect(sx + 6, sy + 10, 2, 8)
      ctx.fillRect(sx + 20, sy + 6, 2, 10)
      // Mushroom
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(sx + 14, sy + 18, 4, 8)
      ctx.fillStyle = '#cc4444'
      ctx.fillRect(sx + 10, sy + 12, 12, 8)
      ctx.fillStyle = '#fff'
      ctx.fillRect(sx + 12, sy + 14, 3, 3)
      ctx.fillRect(sx + 18, sy + 15, 2, 2)
      break

    case T.NPC_HOUSE:
      ctx.fillStyle = '#666680'
      ctx.fillRect(sx, sy, s, s)
      ctx.fillStyle = '#777790'
      ctx.fillRect(sx, sy, s, 2)
      ctx.fillRect(sx, sy, 2, s)
      break

    case T.PATH:
      // Already filled with base color, add some texture
      ctx.fillStyle = '#b8986'
      break
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, px: number, py: number, s: number, dir: string, step: number) {
  const c = s / 16

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(px + 3 * c, py + 14 * c, 10 * c, 2 * c)

  // Legs
  ctx.fillStyle = '#334'
  if (step % 2 === 0) {
    ctx.fillRect(px + 5 * c, py + 11 * c, 3 * c, 4 * c)
    ctx.fillRect(px + 9 * c, py + 12 * c, 3 * c, 3 * c)
  } else {
    ctx.fillRect(px + 5 * c, py + 12 * c, 3 * c, 3 * c)
    ctx.fillRect(px + 9 * c, py + 11 * c, 3 * c, 4 * c)
  }

  // Body
  ctx.fillStyle = '#4466cc'
  ctx.fillRect(px + 4 * c, py + 6 * c, 8 * c, 6 * c)
  ctx.fillStyle = '#5577dd'
  ctx.fillRect(px + 5 * c, py + 7 * c, 6 * c, 2 * c)

  // Backpack (visible from all directions)
  ctx.fillStyle = '#8b6914'
  if (dir === 'left') {
    ctx.fillRect(px + 11 * c, py + 7 * c, 3 * c, 4 * c)
  } else if (dir === 'right') {
    ctx.fillRect(px + 2 * c, py + 7 * c, 3 * c, 4 * c)
  } else if (dir === 'up') {
    ctx.fillRect(px + 4 * c, py + 7 * c, 8 * c, 4 * c)
    ctx.fillStyle = '#a0781e'
    ctx.fillRect(px + 5 * c, py + 8 * c, 6 * c, 2 * c)
  }

  // Head
  ctx.fillStyle = '#ffcc88'
  ctx.fillRect(px + 5 * c, py + 2 * c, 6 * c, 5 * c)

  // Hair
  ctx.fillStyle = '#553322'
  ctx.fillRect(px + 4 * c, py + 1 * c, 8 * c, 3 * c)

  // Hat
  ctx.fillStyle = '#cc3333'
  ctx.fillRect(px + 4 * c, py + 0 * c, 8 * c, 2 * c)
  ctx.fillRect(px + 3 * c, py + 1 * c, 10 * c, 1 * c)

  // Eyes based on direction
  ctx.fillStyle = '#111'
  if (dir === 'down') {
    ctx.fillRect(px + 6 * c, py + 4 * c, c, c)
    ctx.fillRect(px + 9 * c, py + 4 * c, c, c)
  } else if (dir === 'up') {
    // Back of head - show hair only
    ctx.fillStyle = '#553322'
    ctx.fillRect(px + 5 * c, py + 2 * c, 6 * c, 3 * c)
  } else  if (dir === 'left') {
    ctx.fillRect(px + 5 * c, py + 4 * c, c, c)
  } else {
    ctx.fillRect(px + 10 * c, py + 4 * c, c, c)
  }
}

// ==================== NPC SYSTEM ====================
const NPC_COLORS: Record<string, { hat: string; body: string; accent: string }> = {
  warrior: { hat: '#cc4444', body: '#884422', accent: '#ffcc44' },
  mage:    { hat: '#6644cc', body: '#3322aa', accent: '#aaddff' },
  ranger:  { hat: '#338833', body: '#226622', accent: '#88cc44' },
  monk:    { hat: '#cc8833', body: '#aa6622', accent: '#ffee88' },
  witch:   { hat: '#552266', body: '#440055', accent: '#cc44ff' },
  knight:  { hat: '#666688', body: '#444466', accent: '#ccccee' },
}

export function drawNpc(ctx: CanvasRenderingContext2D, px: number, py: number, s: number, sprite: string, time: number) {
  const c = s / 16
  const bob = Math.sin(time * 0.002) * c

  const colors = NPC_COLORS[sprite] || NPC_COLORS.warrior

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(px + 3 * c, py + 14 * c, 10 * c, 2 * c)

  // Legs
  ctx.fillStyle = '#334'
  ctx.fillRect(px + 5 * c, py + 11 * c + bob, 3 * c, 4 * c)
  ctx.fillRect(px + 9 * c, py + 11 * c + bob, 3 * c, 4 * c)

  // Body
  ctx.fillStyle = colors.body
  ctx.fillRect(px + 4 * c, py + 6 * c + bob, 8 * c, 6 * c)
  ctx.fillStyle = colors.accent
  ctx.fillRect(px + 6 * c, py + 7 * c + bob, 4 * c, 2 * c)

  // Head
  ctx.fillStyle = '#ffcc88'
  ctx.fillRect(px + 5 * c, py + 2 * c + bob, 6 * c, 5 * c)

  // Hat
  ctx.fillStyle = colors.hat
  ctx.fillRect(px + 4 * c, py + 0 * c + bob, 8 * c, 3 * c)
  ctx.fillRect(px + 3 * c, py + 2 * c + bob, 10 * c, 1 * c)

  // Eyes
  ctx.fillStyle = '#111'
  ctx.fillRect(px + 6 * c, py + 4 * c + bob, c, c)
  ctx.fillRect(px + 9 * c, py + 4 * c + bob, c, c)

  // Exclamation mark above head
  ctx.fillStyle = '#ffcc44'
  ctx.fillRect(px + 7 * c, py - 4 * c + bob, 2 * c, 3 * c)
  ctx.fillRect(px + 7 * c, py - 0.5 * c + bob, 2 * c, 1 * c)
}

function randInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function findValidSpawn(map: number[][], xMin: number, xMax: number, yMin: number, yMax: number): { x: number; y: number } {
  for (let tries = 0; tries < 200; tries++) {
    const x = randInRange(xMin, xMax)
    const y = randInRange(yMin, yMax)
    if (y >= 0 && y < MH && x >= 0 && x < MW) {
      const tile = map[y][x]
      if (!IMPASSABLE.has(tile) && !ENCOUNTER_TILES.has(tile) && tile !== T.HEAL_DOOR && tile !== T.SHOP_DOOR && tile !== T.COLLECT_DOOR && tile !== T.BAG_DOOR) {
        return { x, y }
      }
    }
  }
  return { x: randInRange(xMin, xMax), y: randInRange(yMin, yMax) }
}

export function spawnNpcs(): NpcDef[] {
  const map = WORLD_MAP
  const spawns = [
    findValidSpawn(map, 34, 47, 22, 34),   // town
    findValidSpawn(map, 8, 28, 18, 38),     // meadow
    findValidSpawn(map, 8, 28, 18, 38),     // meadow
    findValidSpawn(map, 54, 72, 6, 16),     // mountain/ruins
    findValidSpawn(map, 54, 72, 14, 42),    // forest
    findValidSpawn(map, 22, 58, 42, 50),    // volcano
  ]
  return NPC_TEMPLATES.map((npc, i) => ({ ...npc, x: spawns[i].x, y: spawns[i].y }))
}

const NPC_TEMPLATES: NpcDef[] = [
  {
    id: 'npc_warrior', name: 'Blade Master Kai', x: 0, y: 0,
    sprite: 'warrior',
    dialog: [
      'Hey there, adventurer!',
      'I am Blade Master Kai, the strongest warrior in Monster Town!',
      'Think you can beat my fire monster? Let\'s duel!',
    ],
    duelDialog: 'Prepare yourself! My Inferno Beast will burn you!',
    defeatDialog: 'Impressive... You beat me fair and square. Here, take some gold!',
    monster: {
      id: 'npc_mon_1', name: 'Inferno Beast', element: 'fire', rarity: 'uncommon',
      level: 3, hp: 65, maxHp: 65, atk: 18, def: 12, spd: 14, spriteIndex: 0,
      description: 'A fierce beast wreathed in flames.', lore: 'Born from volcanic ash.',
      skills: [
        { name: 'Flame Slash', element: 'fire', power: 22, description: 'Fiery blade strike' },
        { name: 'Ember Rush', element: 'fire', power: 16, description: 'Quick fire dash' },
      ],
    },
  },
  {
    id: 'npc_mage', name: 'Sage Elara', x: 0, y: 0,
    sprite: 'mage',
    dialog: [
      'Greetings, young tamer.',
      'I study the arcane arts of water magic.',
      'Care to test your skills against my Crystal Serpent?',
    ],
    duelDialog: 'The tides will wash away your monster!',
    defeatDialog: 'The currents favor you today... Well done!',
    monster: {
      id: 'npc_mon_2', name: 'Crystal Serpent', element: 'water', rarity: 'rare',
      level: 5, hp: 80, maxHp: 80, atk: 20, def: 16, spd: 18, spriteIndex: 5,
      description: 'A serpent made of living crystal water.', lore: 'Dwells in the deepest springs.',
      skills: [
        { name: 'Tidal Wave', element: 'water', power: 25, description: 'Massive water blast' },
        { name: 'Ice Fang', element: 'water', power: 18, description: 'Freezing bite attack' },
      ],
    },
  },
  {
    id: 'npc_ranger', name: 'Ranger Finn', x: 0, y: 0,
    sprite: 'ranger',
    dialog: [
      'Shhh... I\'m tracking rare monsters here.',
      'Oh, you\'re a tamer too? Nice!',
      'My Thornbeast is unbeatable in these meadows. Wanna try?',
    ],
    duelDialog: 'Nature will be your judge! Go, Thornbeast!',
    defeatDialog: 'Whoa, you tamed that situation well! Respect!',
    monster: {
      id: 'npc_mon_3', name: 'Thornbeast', element: 'earth', rarity: 'uncommon',
      level: 4, hp: 75, maxHp: 75, atk: 16, def: 20, spd: 10, spriteIndex: 10,
      description: 'A beast covered in sharp thorns.', lore: 'Guardian of the ancient meadows.',
      skills: [
        { name: 'Vine Whip', element: 'earth', power: 20, description: 'Thorny vine lash' },
        { name: 'Root Slam', element: 'earth', power: 24, description: 'Ground-shaking slam' },
      ],
    },
  },
  {
    id: 'npc_monk', name: 'Master Zhen', x: 0, y: 0,
    sprite: 'monk',
    dialog: [
      'Ah, a traveler from afar...',
      'I have trained in these mountains for decades.',
      'Only the worthy may pass. Show me your strength!',
    ],
    duelDialog: 'The storm answers my call! Face my Thunder Hawk!',
    defeatDialog: 'You have proven worthy. The mountain spirits acknowledge you.',
    monster: {
      id: 'npc_mon_4', name: 'Thunder Hawk', element: 'lightning', rarity: 'rare',
      level: 7, hp: 90, maxHp: 90, atk: 24, def: 14, spd: 26, spriteIndex: 20,
      description: 'A hawk that rides lightning bolts.', lore: 'Nests atop storm clouds.',
      skills: [
        { name: 'Lightning Dive', element: 'lightning', power: 28, description: 'Electrified diving attack' },
        { name: 'Spark Storm', element: 'lightning', power: 22, description: 'Area lightning burst' },
      ],
    },
  },
  {
    id: 'npc_witch', name: 'Witch Morgana', x: 0, y: 0,
    sprite: 'witch',
    dialog: [
      'Hehehe... Lost in the dark forest?',
      'I\'ve been expecting you, little tamer.',
      'My Shadow Wraith hungers for a battle...',
    ],
    duelDialog: 'Darkness consume you! Rise, Shadow Wraith!',
    defeatDialog: 'Hmph... Light prevails this time. But I\'ll be back!',
    monster: {
      id: 'npc_mon_5', name: 'Shadow Wraith', element: 'shadow', rarity: 'epic',
      level: 8, hp: 100, maxHp: 100, atk: 28, def: 18, spd: 22, spriteIndex: 25,
      description: 'A wraith born from pure darkness.', lore: 'Feeds on fear and shadows.',
      skills: [
        { name: 'Dark Pulse', element: 'shadow', power: 30, description: 'Wave of dark energy' },
        { name: 'Nightmare', element: 'shadow', power: 24, description: 'Haunting nightmare attack' },
      ],
    },
  },
  {
    id: 'npc_knight', name: 'Knight Captain Sol', x: 0, y: 0,
    sprite: 'knight',
    dialog: [
      'Halt! I am Knight Captain Sol.',
      'The Inferno Peaks are dangerous territory.',
      'Prove your worth or turn back! My Lava Golem awaits!',
    ],
    duelDialog: 'For honor and glory! Lava Golem, charge!',
    defeatDialog: 'You have earned your passage, brave tamer. Well fought!',
    monster: {
      id: 'npc_mon_6', name: 'Lava Golem', element: 'fire', rarity: 'epic',
      level: 9, hp: 120, maxHp: 120, atk: 30, def: 26, spd: 8, spriteIndex: 2,
      description: 'A massive golem of molten rock.', lore: 'Forged in the heart of the volcano.',
      skills: [
        { name: 'Magma Fist', element: 'fire', power: 32, description: 'Devastating lava punch' },
        { name: 'Eruption', element: 'fire', power: 28, description: 'Volcanic explosion' },
      ],
    },
  },
]
