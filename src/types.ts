export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'lightning' | 'shadow' | 'light'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type GameScreen = 'landing' | 'map' | 'battle' | 'collection' | 'inventory' | 'shop_screen'
export type ItemCategory = 'potion' | 'ball' | 'boost' | 'key'

export interface MonsterSkill {
  name: string
  element: Element
  power: number
  description: string
}

export interface Monster {
  id: string
  name: string
  element: Element
  rarity: Rarity
  level: number
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  skills: MonsterSkill[]
  description: string
  spriteIndex: number
  lore: string
}

export interface ItemDef {
  id: string
  name: string
  category: ItemCategory
  description: string
  price: number
  sellPrice: number
  icon: string
}

export interface InventorySlot {
  itemId: string
  quantity: number
}

export interface PlayerState {
  name: string
  level: number
  xp: number
  xpToNext: number
  gold: number
  monstersDefeated: number
  monstersCaptured: number
  inventory: InventorySlot[]
  activeMonsterIndex: number
}

export interface ZoneInfo {
  name: string
  elements: Element[]
  minLevel: number
  color: string
  bgGradient: [string, string]
}

export interface BattleAnim {
  type: 'idle' | 'player_attack' | 'enemy_attack' | 'damage' | 'victory' | 'defeat' | 'capture'
  startTime: number
  duration: number
  data?: Record<string, unknown>
}

export interface NpcDef {
  id: string
  name: string
  x: number
  y: number
  sprite: 'warrior' | 'mage' | 'ranger' | 'monk' | 'witch' | 'knight'
  dialog: string[]
  duelDialog: string
  defeatDialog: string
  monster: Monster
}
