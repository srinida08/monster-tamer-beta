import { ItemDef } from './types'

export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: 'potion',
    name: 'Potion',
    category: 'potion',
    description: 'Restores 40 HP to one monster.',
    price: 30,
    sellPrice: 15,
    icon: '\uD83D\uDC8A',
  },
  super_potion: {
    id: 'super_potion',
    name: 'Super Potion',
    category: 'potion',
    description: 'Restores 100 HP to one monster.',
    price: 80,
    sellPrice: 40,
    icon: '\uD83D\uDC9A',
  },
  max_potion: {
    id: 'max_potion',
    name: 'Max Potion',
    category: 'potion',
    description: 'Fully restores HP to one monster.',
    price: 200,
    sellPrice: 100,
    icon: '\uD83D\uDC9C',
  },
  revive: {
    id: 'revive',
    name: 'Revive',
    category: 'potion',
    description: 'Revives a fainted monster with 50% HP.',
    price: 150,
    sellPrice: 75,
    icon: '\u2B50',
  },
  capture_ball: {
    id: 'capture_ball',
    name: 'Capture Ball',
    category: 'ball',
    description: 'A basic ball for capturing monsters.',
    price: 80,
    sellPrice: 40,
    icon: '\uD83D\uDD2E',
  },
  great_ball: {
    id: 'great_ball',
    name: 'Great Ball',
    category: 'ball',
    description: 'An improved ball with higher capture rate.',
    price: 200,
    sellPrice: 100,
    icon: '\uD83D\uDFE0',
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'Ultra Ball',
    category: 'ball',
    description: 'A premium ball with the best capture rate.',
    price: 500,
    sellPrice: 250,
    icon: '\uD83D\uDFE1',
  },
  atk_boost: {
    id: 'atk_boost',
    name: 'ATK Crystal',
    category: 'boost',
    description: 'Boosts ATK by 20% for one battle.',
    price: 120,
    sellPrice: 60,
    icon: '\u2694\uFE0F',
  },
  def_boost: {
    id: 'def_boost',
    name: 'DEF Crystal',
    category: 'boost',
    description: 'Boosts DEF by 20% for one battle.',
    price: 120,
    sellPrice: 60,
    icon: '\uD83D\uDEE1\uFE0F',
  },
  spd_boost: {
    id: 'spd_boost',
    name: 'SPD Crystal',
    category: 'boost',
    description: 'Boosts SPD by 20% for one battle.',
    price: 120,
    sellPrice: 60,
    icon: '\uD83D\uDCA8',
  },
  town_map: {
    id: 'town_map',
    name: 'Town Map',
    category: 'key',
    description: 'Shows your location on the world map.',
    price: 0,
    sellPrice: 0,
    icon: '\uD83D\uDDFA\uFE0F',
  },
}

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id]
}

export function getShopItems(): ItemDef[] {
  return Object.values(ITEMS).filter(i => i.price > 0)
}
