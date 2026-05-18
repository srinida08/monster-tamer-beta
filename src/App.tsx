import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { Element, Rarity, GameScreen, Monster, MonsterSkill, PlayerState, BattleAnim, NpcDef } from './types'
import { getItem, getShopItems } from './items'
import { renderMonsterSprite, drawBattleBackground, createAttackParticles, updateAndDrawParticles, drawSlashEffect, drawDamageNumber, drawBattleHPBar, Particle } from './sprites'
import { WORLD_MAP, MW, MH, TS, TCX, TCY, T, IMPASSABLE, ENCOUNTER_TILES, ZONES, getZoneAt, getEncounterElements, getEncounterLevel, drawTile, drawPlayer, drawNpc, spawnNpcs } from './worldMap'

const EL: Record<Element, string> = { fire: '\uD83D\uDD25', water: '\uD83D\uDCA7', earth: '\uD83C\uDF3F', wind: '\uD83D\uDCA8', lightning: '\u26A1', shadow: '\uD83C\uDF11', light: '\u2728' }
const EL_N: Record<Element, string> = { fire: 'Fire', water: 'Water', earth: 'Earth', wind: 'Wind', lightning: 'Lightning', shadow: 'Shadow', light: 'Light' }
const RC: Record<Rarity, string> = { common: '#888', uncommon: '#44cc44', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa00' }

async function callMiMoAPI(apiKey: string, messages: { role: string; content: string }[], temperature = 0.85): Promise<string> {
  const r = await fetch('https://api.xiaomimimo.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'MiMo-V2.5-Pro', messages, temperature, max_tokens: 2000 }) })
  if (!r.ok) throw new Error(`API Error ${r.status}`)
  const d = await r.json()
  return d.choices[0].message.content
}

function generateFallbackMonster(element: Element, rarity: Rarity, playerLevel: number): Monster {
  const names: Record<Element, string[]> = {
    fire: ['Infernal Drake', 'Ember Fox', 'Blaze Hound', 'Flame Imp', 'Cinder Wyrm'],
    water: ['Tidal Serpent', 'Aqua Spirit', 'Storm Leviathan', 'Frost Eel', 'Mist Phantom'],
    earth: ['Stone Golem', 'Forest Guardian', 'Iron Boar', 'Moss Titan', 'Root Crawler'],
    wind: ['Gale Hawk', 'Zephyr Sprite', 'Cloud Dancer', 'Storm Kite', 'Breeze Fox'],
    lightning: ['Thunder Tiger', 'Spark Lynx', 'Volt Dragon', 'Storm Beetle', 'Arc Snake'],
    shadow: ['Night Stalker', 'Shade Wolf', 'Dark Wraith', 'Void Bat', 'Gloom Spider'],
    light: ['Celestial Stag', 'Dawn Phoenix', 'Star Unicorn', 'Prism Moth', 'Halo Dove'],
  }
  const n = names[element]
  const nameIdx = Math.floor(Math.random() * n.length)
  const name = n[nameIdx]
  const rm = { common: 1, uncommon: 1.2, rare: 1.5, epic: 1.8, legendary: 2.2 }[rarity]
  const lv = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1)
  const hp = Math.floor((45 + lv * 12) * rm)
  return {
    id: `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name, element, rarity, level: lv, hp, maxHp: hp,
    atk: Math.floor((8 + lv * 3) * rm),
    def: Math.floor((5 + lv * 2) * rm),
    spd: Math.floor((5 + lv * 2) * rm),
    skills: [
      { name: `${EL_N[element]} Strike`, element, power: 20 + lv * 2, description: 'A basic attack.' },
      { name: `${EL_N[element]} Burst`, element, power: 30 + lv * 3, description: 'A powerful blast.' },
    ],
    description: `A wild ${name} radiating ${element} energy.`,
    spriteIndex: nameIdx,
    lore: `${name}s are found in remote areas.`,
  }
}

async function generateMonster(apiKey: string, elements: Element[], playerLevel: number): Promise<Monster> {
  const element = elements[Math.floor(Math.random() * elements.length)]
  const rr = Math.random()
  let rarity: Rarity = 'common'
  if (rr > 0.95 && playerLevel >= 7) rarity = 'legendary'
  else if (rr > 0.85 && playerLevel >= 5) rarity = 'epic'
  else if (rr > 0.65 && playerLevel >= 3) rarity = 'rare'
  else if (rr > 0.40) rarity = 'uncommon'
  if (!apiKey) return generateFallbackMonster(element, rarity, playerLevel)
  try {
    const prompt = `Generate a unique RPG monster. Element: ${element}, Rarity: ${rarity}, Level: ${playerLevel}. Respond ONLY with JSON: {"name":"2-3 words","description":"one sentence","lore":"one sentence","skills":[{"name":"skill","power":15-50,"description":"brief"}]}`
    const raw = await callMiMoAPI(apiKey, [{ role: 'system', content: 'You are a monster designer. Respond with valid JSON only.' }, { role: 'user', content: prompt }], 0.9)
    const data = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    const lv = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1)
    const rm = { common: 1, uncommon: 1.2, rare: 1.5, epic: 1.8, legendary: 2.2 }[rarity]
    const hp = Math.floor((45 + lv * 12) * rm)
    return {
      id: `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: data.name || 'Wild Creature', element, rarity, level: lv, hp, maxHp: hp,
      atk: Math.floor((8 + lv * 3) * rm),
      def: Math.floor((5 + lv * 2) * rm),
      spd: Math.floor((5 + lv * 2) * rm),
      skills: (data.skills || []).slice(0, 2).map((sk: { name: string; power: number; description: string }) => ({
        name: sk.name, element, power: Math.min(60, Math.max(10, sk.power || 20)), description: sk.description || 'An attack.',
      })),
      description: data.description || 'A mysterious creature.',
      spriteIndex: Math.floor(Math.random() * 5),
      lore: data.lore || 'Little is known.',
    }
  } catch { return generateFallbackMonster(element, rarity, playerLevel) }
}

// ==================== GAME MAP ====================
function GameMap({ player, collection, npcs, onEncounter, onHeal, onOpenCollection, onOpenInventory, onOpenShop, onBuyItem, onNpcInteract }: {
  player: PlayerState; collection: Monster[]; npcs: NpcDef[]
  onEncounter: (e: Element[], l: number) => void; onHeal: () => void
  onOpenCollection: () => void; onOpenInventory: () => void; onOpenShop: () => void
  onBuyItem: (i: string) => void; onNpcInteract: (npc: NpcDef) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posRef = useRef({ x: TCX, y: TCY - 1 })
  const dirRef = useRef('down')
  const stepRef = useRef(0)
  const keysRef = useRef(new Set<string>())
  const [zoneName, setZoneName] = useState('\uD83C\uDFD8\uFE0F Monster Town')
  const [dialog, setDialog] = useState<{ type: string; text: string } | null>(null)
  const [showMiniShop, setShowMiniShop] = useState(false)
  const dialogRef = useRef(dialog)
  const shopRef = useRef(showMiniShop)
  const onEncRef = useRef(onEncounter)
  const onHealRef = useRef(onHeal)
  const onCollRef = useRef(onOpenCollection)
  const onInvRef = useRef(onOpenInventory)
  const onShopRef = useRef(onOpenShop)
  const onNpcRef = useRef(onNpcInteract)
  const npcsRef = useRef(npcs)

  dialogRef.current = dialog
  shopRef.current = showMiniShop
  onEncRef.current = onEncounter
  onHealRef.current = onHeal
  onCollRef.current = onOpenCollection
  onInvRef.current = onOpenInventory
  onShopRef.current = onOpenShop
  onNpcRef.current = onNpcInteract
  npcsRef.current = npcs

  useEffect(() => {
    const saved = localStorage.getItem('mmt_player_pos')
    if (saved) try { posRef.current = JSON.parse(saved) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e'].includes(e.key.toLowerCase())) e.preventDefault()
      if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i') { e.preventDefault(); onInvRef.current() }
      if (e.key.toLowerCase() === 'c') { e.preventDefault(); onCollRef.current() }
      if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === ' ') {
        const p = posRef.current
        for (const npc of npcsRef.current) {
          const dist = Math.abs(npc.x - p.x) + Math.abs(npc.y - p.y)
          if (dist <= 1) { onNpcRef.current(npc); break }
        }
      }
    }
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    let animId: number
    let lastMove = 0
    const MOVE_DELAY = 140

    const loop = (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) { animId = requestAnimationFrame(loop); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { animId = requestAnimationFrame(loop); return }

      if (!dialogRef.current && !shopRef.current && time - lastMove > MOVE_DELAY) {
        const keys = keysRef.current
        let dx = 0, dy = 0
        if (keys.has('arrowup') || keys.has('w')) { dy = -1; dirRef.current = 'up' }
        else if (keys.has('arrowdown') || keys.has('s')) { dy = 1; dirRef.current = 'down' }
        else if (keys.has('arrowleft') || keys.has('a')) { dx = -1; dirRef.current = 'left' }
        else if (keys.has('arrowright') || keys.has('d')) { dx = 1; dirRef.current = 'right' }

        if (dx !== 0 || dy !== 0) {
          const pos = posRef.current
          const nx = pos.x + dx, ny = pos.y + dy
          if (nx >= 0 && nx < MW && ny >= 0 && ny < MH) {
            const tile = WORLD_MAP[ny][nx]
            const npcBlocking = npcsRef.current.some(n => n.x === nx && n.y === ny)
            if (!IMPASSABLE.has(tile) && !npcBlocking) {
              posRef.current = { x: nx, y: ny }
              stepRef.current++
              lastMove = time
              localStorage.setItem('mmt_player_pos', JSON.stringify({ x: nx, y: ny }))
              const zone = getZoneAt(nx, ny)
              const zi = ZONES[zone]
              if (zi) setZoneName(zi.name)

              if (ENCOUNTER_TILES.has(tile)) {
                const chance = tile === T.TALL_GRASS ? 0.10 : 0.13
                if (Math.random() < chance) {
                  const el = getEncounterElements(tile)
                  const lv = getEncounterLevel(nx, ny)
                  setTimeout(() => onEncRef.current(el, lv), 800)
                  animId = requestAnimationFrame(loop)
                  return
                }
              }

              if (tile === T.HEAL_DOOR) {
                onHealRef.current()
                setDialog({ type: 'heal', text: 'Welcome to the Heal Center!\nAll monsters fully healed!' })
                setTimeout(() => setDialog(null), 2000)
              } else if (tile === T.COLLECT_DOOR) {
                onCollRef.current()
              } else if (tile === T.SHOP_DOOR) {
                onShopRef.current()
              } else if (tile === T.BAG_DOOR) {
                onInvRef.current()
              } else if (tile === T.SIGN) {
                setDialog({ type: 'sign', text: 'Welcome to Monster Town!\nExplore the wilds to find monsters.\nPress B for Bag, C for Collection.' })
                setTimeout(() => setDialog(null), 4000)
              }
            }
          }
        }
      }

      const { width: cw, height: ch } = canvas
      const offsetX = Math.floor(cw / 2) - posRef.current.x * TS - TS / 2
      const offsetY = Math.floor(ch / 2) - posRef.current.y * TS - TS / 2

      ctx.fillStyle = '#111133'
      ctx.fillRect(0, 0, cw, ch)

      const stx = Math.max(0, Math.floor(-offsetX / TS) - 1)
      const sty = Math.max(0, Math.floor(-offsetY / TS) - 1)
      const etx = Math.min(MW, stx + Math.ceil(cw / TS) + 3)
      const ety = Math.min(MH, sty + Math.ceil(ch / TS) + 3)

      for (let my = sty; my < ety; my++) {
        for (let mx = stx; mx < etx; mx++) {
          drawTile(ctx, mx * TS + offsetX, my * TS + offsetY, TS, WORLD_MAP[my][mx], time)
        }
      }

      for (const npc of npcsRef.current) {
        const npx = npc.x * TS + offsetX
        const npy = npc.y * TS + offsetY
        if (npx > -TS && npx < cw + TS && npy > -TS && npy < ch + TS) {
          drawNpc(ctx, npx, npy, TS, npc.sprite, time)
        }
      }

      drawPlayer(ctx, posRef.current.x * TS + offsetX, posRef.current.y * TS + offsetY, TS, dirRef.current, stepRef.current)

      const pos = posRef.current
      for (const npc of npcsRef.current) {
        const dist = Math.abs(npc.x - pos.x) + Math.abs(npc.y - pos.y)
        if (dist <= 1) {
          const npx = npc.x * TS + offsetX
          const npy = npc.y * TS + offsetY
          ctx.fillStyle = 'rgba(255,204,68,0.7)'
          ctx.font = `bold ${Math.floor(TS * 0.28)}px monospace`
          ctx.textAlign = 'center'
          ctx.fillText('[E] Talk', npx + TS / 2, npy - 6)
        }
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  const handleDpad = useCallback((dir: string) => {
    keysRef.current.add(dir)
    setTimeout(() => keysRef.current.delete(dir), 160)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="game-hud">
        <div className="hud-panel">
          <div style={{ color: '#ffcc44', marginBottom: 4 }}>{player.name} Lv.{player.level}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
            <span>{'\uD83C\uDFC6'} {player.gold}g</span>
            <span>{'\uD83D\uDCE6'} {collection.length}</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <div style={{ color: '#66ccff', fontSize: 7 }}>XP {player.xp}/{player.xpToNext}</div>
            <div className="hp-bar-bg" style={{ height: 8 }}>
              <div className="hp-bar-fill hp-blue" style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="quick-actions">
        <button className="quick-btn" onClick={onOpenInventory} title="Bag (B)">{'\uD83C\uDF92'}</button>
        <button className="quick-btn" onClick={onOpenCollection} title="Collection (C)">{'\uD83D\uDCE6'}</button>
        <button className="quick-btn" onClick={onOpenShop} title="Shop">{'\uD83D\uDED2'}</button>
      </div>
      <div className="zone-banner" key={zoneName}>{zoneName}</div>
      <div className="controls-hint">WASD/Arrows: Move | E: Talk | B: Bag | C: Collection</div>
      <div className="dpad">
        <button className="dpad-btn dpad-up" onPointerDown={() => handleDpad('w')}>{'\u25B2'}</button>
        <button className="dpad-btn dpad-left" onPointerDown={() => handleDpad('a')}>{'\u25C0'}</button>
        <button className="dpad-btn dpad-right" onPointerDown={() => handleDpad('d')}>{'\u25B6'}</button>
        <button className="dpad-btn dpad-down" onPointerDown={() => handleDpad('s')}>{'\u25BC'}</button>
      </div>
      {dialog && (
        <div className="dialog-overlay" onClick={() => setDialog(null)}>
          <div className="pixel-panel slide-up" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{dialog.type === 'heal' ? '\uD83D\uDC96' : '\uD83D\uDCDC'}</div>
            <div style={{ whiteSpace: 'pre-line' }}>{dialog.text}</div>
          </div>
        </div>
      )}
      {showMiniShop && (
        <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMiniShop(false) }}>
          <div className="pixel-panel slide-up" style={{ maxWidth: 350 }}>
            <div style={{ fontSize: 12, color: '#ffcc44', marginBottom: 12, textAlign: 'center' }}>{'\uD83D\uDED2'} QUICK SHOP</div>
            <div style={{ color: '#aaa', marginBottom: 8, textAlign: 'center' }}>Gold: {player.gold}g</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="pixel-btn" disabled={player.gold < 30} onClick={() => onBuyItem('potion')}>{'\uD83D\uDC8A'} Potion (30g)</button>
              <button className="pixel-btn" disabled={player.gold < 80} onClick={() => onBuyItem('capture_ball')}>{'\uD83D\uDD2E'} Capture Ball (80g)</button>
            </div>
            <button className="pixel-btn danger" style={{ marginTop: 12, width: '100%' }} onClick={() => setShowMiniShop(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== VISUAL BATTLE ====================
function BattleScene({ playerMonster, enemyMonster, apiKey, player, onVictory, onDefeat, onCapture, onUseItem }: {
  playerMonster: Monster | null; enemyMonster: Monster; apiKey: string; player: PlayerState
  onVictory: () => void; onDefeat: () => void; onCapture: (m: Monster) => void
  onUseItem: (itemId: string) => void
}) {
  const [pMon, setPMon] = useState<Monster>(() => playerMonster ? { ...playerMonster } : {
    id: 'starter', name: 'Spark Pup', element: 'lightning' as Element, rarity: 'uncommon' as Rarity,
    level: 1, hp: 85, maxHp: 85, atk: 16, def: 10, spd: 12,
    skills: [
      { name: 'Tackle', element: 'earth' as Element, power: 20, description: 'A basic tackle.' },
      { name: 'Spark Bite', element: 'lightning' as Element, power: 30, description: 'Electric bite.' },
    ],
    description: 'A loyal starter.', spriteIndex: 0, lore: 'Your first friend.',
  })
  const [eMon, setEMon] = useState<Monster>({ ...enemyMonster })
  const [log, setLog] = useState<string[]>(['\u2694 Battle Start!'])
  const [turn, setTurn] = useState<'player' | 'enemy' | 'waiting'>('player')
  const [capturing, setCapturing] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [showItemMenu, setShowItemMenu] = useState(false)

  const battleCanvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<BattleAnim>({ type: 'idle', startTime: 0, duration: 0 })
  const particlesRef = useRef<Particle[]>([])
  const dmgNumRef = useRef<{ x: number; y: number; dmg: number; start: number; isHeal: boolean }[]>([])
  const pMonRef = useRef(pMon)
  const eMonRef = useRef(eMon)
  pMonRef.current = pMon
  eMonRef.current = eMon

  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [log])
  const addLog = (msg: string) => setLog(prev => [...prev, msg])

  const calcDmg = (a: Monster, d: Monster, sk: MonsterSkill) =>
    Math.max(1, Math.floor((sk.power * 0.4 * (1 + a.atk / (a.atk + d.def + 10))) * (0.85 + Math.random() * 0.3)))

  useEffect(() => {
    let animId: number
    const canvas = battleCanvasRef.current
    if (!canvas) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const loop = (time: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { animId = requestAnimationFrame(loop); return }
      const w = canvas.width, h = canvas.height
      const anim = animRef.current

      drawBattleBackground(ctx, w, h, eMonRef.current.element, time)

      const pPlatX = w * 0.22, pPlatY = h * 0.52
      const ePlatX = w * 0.72, ePlatY = h * 0.38

      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath(); ctx.ellipse(pPlatX, pPlatY + 60, 50, 15, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(ePlatX, ePlatY + 60, 50, 15, 0, 0, Math.PI * 2); ctx.fill()

      const spriteSize = Math.min(96, w * 0.14)
      let pOffX = 0, pOffY = 0, eOffX = 0, eOffY = 0
      let pFlash = false, eFlash = false
      const animProgress = anim.duration > 0 ? Math.min(1, (time - anim.startTime) / anim.duration) : 1

      if (anim.type === 'player_attack' && animProgress < 1) {
        const phase = animProgress < 0.4 ? animProgress / 0.4 : (1 - animProgress) / 0.6
        pOffX = phase * (ePlatX - pPlatX) * 0.3; pOffY = -phase * 20
        if (animProgress > 0.3 && animProgress < 0.7) eFlash = Math.floor(time / 80) % 2 === 0
      } else if (anim.type === 'enemy_attack' && animProgress < 1) {
        const phase = animProgress < 0.4 ? animProgress / 0.4 : (1 - animProgress) / 0.6
        eOffX = -phase * (ePlatX - pPlatX) * 0.3; eOffY = -phase * 20
        if (animProgress > 0.3 && animProgress < 0.7) pFlash = Math.floor(time / 80) % 2 === 0
      }

      const pBob = Math.sin(time * 0.003) * 4, eBob = Math.sin(time * 0.003 + 1) * 4

      if (!pFlash) {
        const pSprite = renderMonsterSprite(pMonRef.current.element, pMonRef.current.spriteIndex, spriteSize, false)
        ctx.drawImage(pSprite, pPlatX - spriteSize / 2 + pOffX, pPlatY - spriteSize + pBob + pOffY)
      }
      if (!eFlash) {
        const eSprite = renderMonsterSprite(eMonRef.current.element, eMonRef.current.spriteIndex, spriteSize, true)
        ctx.drawImage(eSprite, ePlatX - spriteSize / 2 + eOffX, ePlatY - spriteSize + eBob + eOffY)
      }

      if (anim.type === 'player_attack' && animProgress > 0.25 && animProgress < 0.75)
        drawSlashEffect(ctx, ePlatX + eOffX, ePlatY - spriteSize / 2 + eBob + eOffY, 60, (animProgress - 0.25) * 2, pMonRef.current.element)
      if (anim.type === 'enemy_attack' && animProgress > 0.25 && animProgress < 0.75)
        drawSlashEffect(ctx, pPlatX + pOffX, pPlatY - spriteSize / 2 + pBob + pOffY, 60, (animProgress - 0.25) * 2, eMonRef.current.element)

      particlesRef.current = updateAndDrawParticles(ctx, particlesRef.current)

      dmgNumRef.current = dmgNumRef.current.filter(d => {
        const p = (time - d.start) / 1200
        if (p >= 1) return false
        drawDamageNumber(ctx, d.x, d.y, d.dmg, p, d.isHeal)
        return true
      })

      const barW = Math.min(140, w * 0.18)
      drawBattleHPBar(ctx, 12, 12, barW, eMonRef.current.hp, eMonRef.current.maxHp, `${eMonRef.current.name} Lv.${eMonRef.current.level}`)
      drawBattleHPBar(ctx, w - barW - 12, h * 0.55 + 80, barW, pMonRef.current.hp, pMonRef.current.maxHp, `${pMonRef.current.name} Lv.${pMonRef.current.level}`)

      ctx.fillStyle = RC[eMonRef.current.rarity]
      ctx.font = "7px 'Press Start 2P', monospace"; ctx.textAlign = 'left'
      ctx.fillText(eMonRef.current.rarity.toUpperCase(), 12, 40)

      if (capturing) {
        const capProgress = ((time % 2000) / 2000)
        const ballX = ePlatX, ballY = ePlatY - 30 - Math.sin(capProgress * Math.PI) * 40
        ctx.fillStyle = '#ee3333'; ctx.fillRect(ballX - 10, ballY - 10, 20, 10)
        ctx.fillStyle = '#eee'; ctx.fillRect(ballX - 10, ballY, 20, 10)
        ctx.fillStyle = '#333'; ctx.fillRect(ballX - 12, ballY - 2, 24, 4)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ballX, ballY, 5, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke()
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [capturing])

  const triggerAnim = (type: BattleAnim['type'], duration: number) => {
    animRef.current = { type, startTime: performance.now(), duration }
  }

  const spawnAttackParticles = (targetSide: 'enemy' | 'player', element: Element) => {
    const canvas = battleCanvasRef.current
    if (!canvas) return
    const w = canvas.width, h = canvas.height
    const x = targetSide === 'enemy' ? w * 0.72 : w * 0.22
    const y = targetSide === 'enemy' ? h * 0.38 : h * 0.52
    particlesRef.current = [...particlesRef.current, ...createAttackParticles(x, y - 30, element, 15)]
  }

  const spawnDmgNum = (side: 'enemy' | 'player', dmg: number, isHeal: boolean) => {
    const canvas = battleCanvasRef.current
    if (!canvas) return
    const w = canvas.width, h = canvas.height
    const x = side === 'enemy' ? w * 0.72 : w * 0.22
    const y = side === 'enemy' ? h * 0.30 : h * 0.45
    dmgNumRef.current.push({ x, y, dmg, start: performance.now(), isHeal })
  }

  const handlePlayerAttack = async (skill: MonsterSkill) => {
    if (turn !== 'player') return
    setTurn('waiting')
    triggerAnim('player_attack', 900)
    setTimeout(() => spawnAttackParticles('enemy', skill.element), 300)
    const dmg = calcDmg(pMon, eMon, skill)
    const newEHp = Math.max(0, eMon.hp - dmg)
    setTimeout(() => { setEMon(prev => ({ ...prev, hp: newEHp })); spawnDmgNum('enemy', dmg, false) }, 400)

    if (apiKey) {
      try {
        const narr = await callMiMoAPI(apiKey, [
          { role: 'system', content: 'Narrate this RPG attack in 1 short sentence (max 15 words).' },
          { role: 'user', content: `${pMon.name} uses ${skill.name} on ${eMon.name} for ${dmg} damage.` },
        ], 0.9)
        addLog(`\uD83D\uDFE2 ${narr.trim().replace(/"/g, '')}`)
      } catch { addLog(`\uD83D\uDFE2 ${pMon.name} uses ${skill.name}! ${dmg} dmg!`) }
    } else { addLog(`\uD83D\uDFE2 ${pMon.name} uses ${skill.name}! ${dmg} dmg to ${eMon.name}!`) }

    if (newEHp <= 0) { addLog(`\uD83C\uDFC6 ${eMon.name} defeated!`); setTimeout(() => setShowVictory(true), 1200); return }

    setTimeout(() => {
      triggerAnim('enemy_attack', 900)
      setTimeout(() => spawnAttackParticles('player', eMon.element), 300)
      const eSkill = eMon.skills[Math.floor(Math.random() * eMon.skills.length)]
      const eDmg = calcDmg(eMon, pMon, eSkill)
      const newPHp = Math.max(0, pMon.hp - eDmg)
      setTimeout(() => { setPMon(prev => ({ ...prev, hp: newPHp })); spawnDmgNum('player', eDmg, false) }, 400)
      addLog(`\uD83D\uDD34 ${eMon.name} uses ${eSkill.name}! ${eDmg} dmg!`)
      if (newPHp <= 0) { addLog(`\uD83D\uDC80 ${pMon.name} fainted!`); setTimeout(() => onDefeat(), 2000) }
      else { setTimeout(() => setTurn('player'), 1000) }
    }, 1200)
  }

  const handleCapture = (ballType: string) => {
    const ballItem = getItem(ballType)
    if (!ballItem) return
    const ballCount = player.inventory.find(s => s.itemId === ballType)?.quantity || 0
    if (ballCount <= 0) { addLog('\u274C No capture balls!'); return }
    setCapturing(true); onUseItem(ballType)
    let rateBonus = 0
    if (ballType === 'great_ball') rateBonus = 0.15
    if (ballType === 'ultra_ball') rateBonus = 0.30
    const rate = Math.min(0.95, 0.35 + (1 - eMon.hp / eMon.maxHp) * 0.5 +
      (eMon.rarity === 'common' ? 0.25 : eMon.rarity === 'uncommon' ? 0.15 : eMon.rarity === 'rare' ? 0.05 : 0) + rateBonus)
    const success = Math.random() < rate
    setTimeout(() => {
      setCapturing(false)
      if (success) { addLog(`\uD83C\uDF89 ${eMon.name} captured!`); onCapture({ ...enemyMonster, hp: enemyMonster.maxHp }) }
      else { addLog(`\u274C ${eMon.name} broke free!`) }
    }, 2500)
  }

  const handleUsePotion = (potionType: string) => {
    const potionCount = player.inventory.find(s => s.itemId === potionType)?.quantity || 0
    if (potionCount <= 0 || turn !== 'player') return
    let heal = 40
    if (potionType === 'super_potion') heal = 100
    if (potionType === 'max_potion') heal = pMon.maxHp
    const newHp = Math.min(pMon.maxHp, pMon.hp + heal)
    const actualHeal = newHp - pMon.hp
    setPMon(prev => ({ ...prev, hp: newHp }))
    spawnDmgNum('player', actualHeal, true)
    addLog(`\uD83D\uDC8A Used ${getItem(potionType)?.name}! Healed ${actualHeal} HP.`)
    onUseItem(potionType); setTurn('waiting'); setShowItemMenu(false)

    setTimeout(() => {
      triggerAnim('enemy_attack', 900)
      setTimeout(() => spawnAttackParticles('player', eMon.element), 300)
      const eSkill = eMon.skills[Math.floor(Math.random() * eMon.skills.length)]
      const eDmg = calcDmg(eMon, pMon, eSkill)
      const afterHp = Math.max(0, newHp - eDmg)
      setTimeout(() => { setPMon(prev => ({ ...prev, hp: afterHp })); spawnDmgNum('player', eDmg, false) }, 400)
      addLog(`\uD83D\uDD34 ${eMon.name} uses ${eSkill.name}! ${eDmg} dmg!`)
      if (afterHp <= 0) { setTimeout(() => onDefeat(), 2000) }
      else { setTimeout(() => setTurn('player'), 1000) }
    }, 1200)
  }

  if (showVictory) {
    const captureBalls = player.inventory.filter(s =>
      ['capture_ball', 'great_ball', 'ultra_ball'].includes(s.itemId) && s.quantity > 0
    )
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pixel-panel bounce-in" style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>{'\uD83C\uDFC6'}</div>
          <div style={{ fontSize: 14, color: '#ffcc44', margin: '12px 0' }}>Victory!</div>
          <div style={{ marginBottom: 8 }}>Defeated {eMon.name}!</div>
          <div style={{ margin: '12px auto', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={el => {
              if (!el) return; el.width = 96; el.height = 96
              const ctx = el.getContext('2d'); if (!ctx) return
              const sprite = renderMonsterSprite(eMon.element, eMon.spriteIndex, 96)
              ctx.drawImage(sprite, 0, 0)
            }} width={96} height={96} style={{ border: `3px solid ${RC[eMon.rarity]}`, background: '#0d0d2b', imageRendering: 'pixelated' }} />
          </div>
          <div style={{ fontSize: 9, color: RC[eMon.rarity], marginBottom: 4 }}>
            {eMon.rarity.toUpperCase()} {EL[eMon.element]} {EL_N[eMon.element]}
          </div>
          {capturing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="capture-ball-px" />
              <div style={{ fontSize: 8 }}>Capturing...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {captureBalls.map(slot => (
                <button key={slot.itemId} className="pixel-btn success" onClick={() => handleCapture(slot.itemId)}>
                  {getItem(slot.itemId)?.icon} {getItem(slot.itemId)?.name} ({slot.quantity})
                </button>
              ))}
              {captureBalls.length === 0 && <div style={{ color: '#888', fontSize: 8 }}>No capture balls!</div>}
              <button className="pixel-btn" onClick={onVictory}>Skip {'\u2192'}</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const potionItems = player.inventory.filter(s =>
    ['potion', 'super_potion', 'max_potion'].includes(s.itemId) && s.quantity > 0
  )
  const captureItems = player.inventory.filter(s =>
    ['capture_ball', 'great_ball', 'ultra_ball'].includes(s.itemId) && s.quantity > 0
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 45%', position: 'relative' }}>
        <canvas ref={battleCanvasRef} style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }} />
      </div>
      <div className="battle-log" ref={logRef} style={{ flex: '1 1 auto', margin: '4px 8px' }}>
        {log.map((e, i) => <div key={i} className="battle-log-entry">{e}</div>)}
      </div>
      <div style={{ fontSize: 9, color: turn === 'player' ? '#88ff88' : '#888', textAlign: 'center', padding: '2px 0' }}>
        {turn === 'player' ? '\uD83D\uDFE2 Your Turn' : turn === 'waiting' ? '\u23F3 Wait...' : '\uD83D\uDD34 Enemy turn...'}
      </div>
      {showItemMenu && (
        <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowItemMenu(false) }}>
          <div className="pixel-panel slide-up" style={{ maxWidth: 350 }}>
            <div style={{ fontSize: 11, color: '#ffcc44', marginBottom: 10, textAlign: 'center' }}>{'\uD83C\uDF92'} Use Item</div>
            {potionItems.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: '#aaa', marginBottom: 4 }}>Potions:</div>
                {potionItems.map(slot => (
                  <button key={slot.itemId} className="skill-btn" style={{ marginBottom: 4 }}
                    onClick={() => handleUsePotion(slot.itemId)}>
                    {getItem(slot.itemId)?.icon} {getItem(slot.itemId)?.name} x{slot.quantity}
                  </button>
                ))}
              </div>
            )}
            {captureItems.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: '#aaa', marginBottom: 4 }}>Capture Balls:</div>
                {captureItems.map(slot => (
                  <button key={slot.itemId} className="skill-btn" style={{ marginBottom: 4 }}
                    onClick={() => { setShowItemMenu(false); handleCapture(slot.itemId) }}>
                    {getItem(slot.itemId)?.icon} {getItem(slot.itemId)?.name} x{slot.quantity}
                  </button>
                ))}
              </div>
            )}
            {potionItems.length === 0 && captureItems.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: 12 }}>No usable items!</div>
            )}
            <button className="pixel-btn danger" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowItemMenu(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '4px 8px 8px' }}>
        {pMon.skills.map((skill, i) => (
          <button key={i} className="skill-btn" disabled={turn !== 'player'} onClick={() => handlePlayerAttack(skill)}>
            {EL[skill.element]} {skill.name}<br />
            <span style={{ fontSize: 7, color: '#888' }}>Pwr: {skill.power}</span>
          </button>
        ))}
        <button className="skill-btn" disabled={turn !== 'player'} onClick={() => setShowItemMenu(true)}>
          {'\uD83C\uDF92'} Items<br />
          <span style={{ fontSize: 7, color: '#888' }}>Use item</span>
        </button>
        <button className="skill-btn" disabled={turn !== 'player'} onClick={onDefeat} style={{ borderColor: '#663333' }}>
          {'\uD83C\uDFC3'} Flee<br />
          <span style={{ fontSize: 7, color: '#888' }}>Run away</span>
        </button>
      </div>
    </div>
  )
}

// ==================== COLLECTION PAGE ====================
function CollectionPage({ collection, onClose, onSetActive, activeIndex }: {
  collection: Monster[]; onClose: () => void; onSetActive: (i: number) => void; activeIndex: number
}) {
  const [filter, setFilter] = useState<Element | 'all'>('all')
  const [selected, setSelected] = useState<Monster | null>(null)
  const elements: (Element | 'all')[] = ['all', 'fire', 'water', 'earth', 'wind', 'lightning', 'shadow', 'light']
  const filtered = filter === 'all' ? collection : collection.filter(m => m.element === filter)

  if (selected) {
    const idx = collection.findIndex(m => m.id === selected.id)
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', overflow: 'auto', padding: 16 }}>
        <button className="pixel-btn" onClick={() => setSelected(null)} style={{ marginBottom: 12 }}>{'\u2190'} Back</button>
        <div className="pixel-panel" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={el => {
              if (!el) return; el.width = 96; el.height = 96
              const ctx = el.getContext('2d'); if (!ctx) return
              ctx.drawImage(renderMonsterSprite(selected.element, selected.spriteIndex, 96), 0, 0)
            }} width={96} height={96} style={{ border: `3px solid ${RC[selected.rarity]}`, background: '#0d0d2b', imageRendering: 'pixelated' }} />
          </div>
          <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>{selected.name}</div>
          <div style={{ fontSize: 9, color: RC[selected.rarity], marginBottom: 8 }}>
            {selected.rarity.toUpperCase()} {EL[selected.element]} {EL_N[selected.element]} Lv.{selected.level}
          </div>
          <div style={{ fontSize: 8, color: '#aaa', marginBottom: 12, fontStyle: 'italic' }}>{selected.description}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div className="pixel-panel-dark">{'\u2764\uFE0F'} HP: {selected.maxHp}</div>
            <div className="pixel-panel-dark">{'\u2694\uFE0F'} ATK: {selected.atk}</div>
            <div className="pixel-panel-dark">{'\uD83D\uDEE1\uFE0F'} DEF: {selected.def}</div>
            <div className="pixel-panel-dark">{'\uD83D\uDCA8'} SPD: {selected.spd}</div>
          </div>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 8 }}>Skills:</div>
          {selected.skills.map((sk, i) => (
            <div key={i} className="pixel-panel-dark" style={{ marginBottom: 6, textAlign: 'left' }}>
              <span>{EL[sk.element]} {sk.name}</span>
              <span style={{ color: '#888', marginLeft: 8 }}>Pwr:{sk.power}</span>
            </div>
          ))}
          <div style={{ fontSize: 8, color: '#666', marginTop: 12, fontStyle: 'italic' }}>{selected.lore}</div>
          {idx >= 0 && (
            <button className={`pixel-btn ${idx === activeIndex ? 'warning' : 'success'}`}
              style={{ marginTop: 12, width: '100%' }} onClick={() => onSetActive(idx)} disabled={idx === activeIndex}>
              {idx === activeIndex ? '\u2B50 Active Monster' : '\u2694\uFE0F Set as Battle Monster'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', overflow: 'auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="pixel-btn" onClick={onClose}>{'\u2190'} Back</button>
        <div style={{ fontSize: 12 }}>{'\uD83D\uDCE6'} Collection</div>
        <div style={{ fontSize: 8, color: '#888' }}>{collection.length} caught</div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {elements.map(el => (
          <button key={el} onClick={() => setFilter(el)} style={{
            padding: '6px 10px', border: `2px solid ${filter === el ? '#fff' : '#444'}`,
            background: filter === el ? '#3344aa' : '#16213e', color: '#fff', cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          }}>{el === 'all' ? 'All' : EL[el as Element]}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>No monsters yet!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
          {filtered.map(m => {
            const globalIdx = collection.findIndex(c => c.id === m.id)
            return (
              <div key={m.id} className={`monster-card-px rarity-${m.rarity}`} onClick={() => setSelected(m)} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <canvas ref={el => {
                    if (!el) return; el.width = 48; el.height = 48
                    const ctx = el.getContext('2d'); if (!ctx) return
                    ctx.clearRect(0, 0, 48, 48)
                    ctx.drawImage(renderMonsterSprite(m.element, m.spriteIndex, 48), 0, 0)
                  }} width={48} height={48} style={{ border: `2px solid ${RC[m.rarity]}`, background: '#16213e', imageRendering: 'pixelated', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 9 }}>
                      {globalIdx === activeIndex && <span style={{ color: '#ffcc44' }}>{'\u2B50'} </span>}
                      {m.name}
                    </div>
                    <div style={{ fontSize: 7, color: '#888' }}>{EL[m.element]} {EL_N[m.element]} Lv.{m.level}</div>
                    <div style={{ fontSize: 7, display: 'flex', gap: 6, color: '#aaa', marginTop: 2 }}>
                      <span>{'\u2764'}{m.maxHp}</span><span>{'\u2694'}{m.atk}</span><span>{'\uD83D\uDEE1'}{m.def}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==================== INVENTORY/BAG PAGE ====================
function InventoryPage({ player, onClose }: { player: PlayerState; onClose: () => void }) {
  const [selectedTab, setSelectedTab] = useState<'potion' | 'ball' | 'boost' | 'key'>('potion')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const tabs: { key: 'potion' | 'ball' | 'boost' | 'key'; label: string; icon: string }[] = [
    { key: 'potion', label: 'Potions', icon: '\uD83D\uDC8A' },
    { key: 'ball', label: 'Balls', icon: '\uD83D\uDD2E' },
    { key: 'boost', label: 'Boosts', icon: '\u26A1' },
    { key: 'key', label: 'Key', icon: '\uD83D\uDD11' },
  ]
  const filteredItems = player.inventory.filter(slot => {
    const item = getItem(slot.itemId)
    return item && item.category === selectedTab && slot.quantity > 0
  })
  const selItemDef = selectedItem ? getItem(selectedItem) : null
  const selSlot = selectedItem ? player.inventory.find(s => s.itemId === selectedItem) : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', overflow: 'auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="pixel-btn" onClick={onClose}>{'\u2190'} Back</button>
        <div style={{ fontSize: 12 }}>{'\uD83C\uDF92'} Bag</div>
        <div style={{ fontSize: 8, color: '#ffcc44' }}>{'\uD83C\uDFC6'} {player.gold}g</div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setSelectedTab(tab.key); setSelectedItem(null) }}
            style={{ flex: 1, padding: '8px 4px', border: `2px solid ${selectedTab === tab.key ? '#fff' : '#444'}`,
              background: selectedTab === tab.key ? '#3344aa' : '#16213e', color: '#fff', cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, textAlign: 'center',
            }}>{tab.icon}<br />{tab.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>No items in this category.</div>
          ) : (
            filteredItems.map(slot => {
              const item = getItem(slot.itemId)
              if (!item) return null
              return (
                <div key={slot.itemId} className={`monster-card-px ${selectedItem === slot.itemId ? 'rarity-rare' : ''}`}
                  onClick={() => setSelectedItem(slot.itemId)} style={{ marginBottom: 4, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ marginRight: 8 }}>{item.icon}</span><span style={{ fontSize: 9 }}>{item.name}</span></div>
                    <span style={{ fontSize: 9, color: '#aaa' }}>x{slot.quantity}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {selItemDef && selSlot && (
          <div className="pixel-panel" style={{ width: 200, alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 20, textAlign: 'center', marginBottom: 8 }}>{selItemDef.icon}</div>
            <div style={{ fontSize: 10, textAlign: 'center', marginBottom: 6 }}>{selItemDef.name}</div>
            <div style={{ fontSize: 7, color: '#aaa', marginBottom: 8 }}>{selItemDef.description}</div>
            <div style={{ fontSize: 7, color: '#888' }}>Owned: {selSlot.quantity}<br />Value: {selItemDef.sellPrice}g</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== SHOP PAGE ====================
function ShopPage({ player, onClose, onBuy, onSell }: {
  player: PlayerState; onClose: () => void
  onBuy: (itemId: string) => void; onSell: (itemId: string) => void
}) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const shopItems = getShopItems()
  const sellableItems = player.inventory.filter(s => {
    const item = getItem(s.itemId)
    return item && item.sellPrice > 0 && s.quantity > 0
  })
  const selDef = selectedItem ? getItem(selectedItem) : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0f23', overflow: 'auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="pixel-btn" onClick={onClose}>{'\u2190'} Back</button>
        <div style={{ fontSize: 12 }}>{'\uD83D\uDED2'} Shop</div>
        <div style={{ fontSize: 8, color: '#ffcc44' }}>{'\uD83C\uDFC6'} {player.gold}g</div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button className={`pixel-btn ${mode === 'buy' ? 'success' : ''}`} style={{ flex: 1 }}
          onClick={() => { setMode('buy'); setSelectedItem(null) }}>{'\uD83D\uDED2'} Buy</button>
        <button className={`pixel-btn ${mode === 'sell' ? 'warning' : ''}`} style={{ flex: 1 }}
          onClick={() => { setMode('sell'); setSelectedItem(null) }}>{'\uD83D\uDCB0'} Sell</button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {mode === 'buy' ? (
            shopItems.map(item => (
              <div key={item.id} className={`monster-card-px ${selectedItem === item.id ? 'rarity-rare' : ''}`}
                onClick={() => setSelectedItem(item.id)} style={{ marginBottom: 4, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><span style={{ marginRight: 8 }}>{item.icon}</span><span style={{ fontSize: 9 }}>{item.name}</span></div>
                  <span style={{ fontSize: 9, color: player.gold >= item.price ? '#ffcc44' : '#ff4444' }}>{item.price}g</span>
                </div>
              </div>
            ))
          ) : (
            sellableItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>Nothing to sell!</div>
            ) : (
              sellableItems.map(slot => {
                const item = getItem(slot.itemId)
                if (!item) return null
                return (
                  <div key={slot.itemId} className={`monster-card-px ${selectedItem === slot.itemId ? 'rarity-rare' : ''}`}
                    onClick={() => setSelectedItem(slot.itemId)} style={{ marginBottom: 4, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span style={{ marginRight: 8 }}>{item.icon}</span><span style={{ fontSize: 9 }}>{item.name}</span> <span style={{ fontSize: 7, color: '#aaa' }}>x{slot.quantity}</span></div>
                      <span style={{ fontSize: 9, color: '#ffcc44' }}>{item.sellPrice}g</span>
                    </div>
                  </div>
                )
              })
            )
          )}
        </div>
        {selDef && (
          <div className="pixel-panel" style={{ width: 220, alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 20, textAlign: 'center', marginBottom: 8 }}>{selDef.icon}</div>
            <div style={{ fontSize: 10, textAlign: 'center', marginBottom: 6 }}>{selDef.name}</div>
            <div style={{ fontSize: 7, color: '#aaa', marginBottom: 8 }}>{selDef.description}</div>
            {mode === 'buy' ? (
              <button className="pixel-btn success" style={{ width: '100%' }}
                disabled={player.gold < selDef.price} onClick={() => onBuy(selDef.id)}>
                Buy for {selDef.price}g
              </button>
            ) : (
              <button className="pixel-btn warning" style={{ width: '100%' }} onClick={() => onSell(selDef.id)}>
                Sell for {selDef.sellPrice}g
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== NPC DIALOG ====================
function NpcDialog({ npc, dialogIndex, onNext, onAcceptDuel, onDecline }: {
  npc: NpcDef; dialogIndex: number
  onNext: () => void; onAcceptDuel: () => void; onDecline: () => void
}) {
  const isLastDialog = dialogIndex >= npc.dialog.length - 1
  const showDuelPrompt = dialogIndex >= npc.dialog.length
  const currentText = showDuelPrompt ? npc.duelDialog : npc.dialog[Math.min(dialogIndex, npc.dialog.length - 1)]

  const spriteColors: Record<string, string> = {
    warrior: '#cc4444', mage: '#6644cc', ranger: '#338833',
    monk: '#cc8833', witch: '#552266', knight: '#666688',
  }

  return (
    <div className="npc-dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget && !showDuelPrompt) onNext() }}>
      <div className="npc-dialog slide-up">
        <div className="npc-dialog-header">
          <div className="npc-avatar" style={{ background: spriteColors[npc.sprite] || '#666' }}>
            {npc.name.charAt(0)}
          </div>
          <div>
            <div className="npc-name">{npc.name}</div>
            <div className="npc-title">{npc.sprite.charAt(0).toUpperCase() + npc.sprite.slice(1)} Trainer</div>
          </div>
        </div>
        <div className="npc-chat-bubble">
          <div className="npc-chat-text">{currentText}</div>
        </div>
        {showDuelPrompt ? (
          <div className="npc-duel-buttons">
            <button className="pixel-btn success" onClick={onAcceptDuel}>{'\u2694\uFE0F'} Accept Duel!</button>
            <button className="pixel-btn danger" onClick={onDecline}>Decline</button>
          </div>
        ) : (
          <div className="npc-duel-buttons">
            {isLastDialog ? (
              <button className="pixel-btn" onClick={onNext}>{'>'} Continue...</button>
            ) : (
              <button className="pixel-btn" onClick={onNext}>{'>'} Next</button>
            )}
          </div>
        )}
        <div className="npc-monster-preview">
          <span style={{ color: '#888', fontSize: 7 }}>Monster: </span>
          <span style={{ color: '#ffcc44', fontSize: 7 }}>{EL[npc.monster.element]} {npc.monster.name} (Lv.{npc.monster.level})</span>
        </div>
      </div>
    </div>
  )
}

// ==================== LANDING PAGE ====================
function LandingPage({ onStart }: { onStart: (name: string, apiKey: string) => void }) {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mmt_apikey') || '')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #0f0f23 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pixel-panel bounce-in" style={{ maxWidth: 420, width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u2694\uFE0F'}</div>
        <h1 style={{ fontSize: 16, color: '#ffcc44', marginBottom: 4 }}>MiMo Monster Tamer</h1>
        <p style={{ fontSize: 7, color: '#888', marginBottom: 4 }}>Explore, battle & capture pixel monsters!</p>
        <p style={{ fontSize: 6, color: '#666', marginBottom: 16 }}>Part of <a href="https://100t.xiaomimimo.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#6688cc' }}>100T MiMo Challenge</a></p>
        <div style={{ marginBottom: 12 }}>
          <input type="text" placeholder="Enter your name..." value={name} onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: '#16213e', border: '2px solid #334', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 8, textAlign: 'center' }}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onStart(name.trim(), apiKey) }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 7, color: '#666', marginBottom: 4 }}>MiMo API Key (optional - for AI monsters)</div>
          <input type="password" placeholder="tp-..." value={apiKey} onChange={e => setApiKey(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: '#16213e', border: '2px solid #334', color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 7, textAlign: 'center' }} />
        </div>
        <button className="pixel-btn success" style={{ width: '100%', padding: '12px 0' }}
          disabled={!name.trim()} onClick={() => onStart(name.trim(), apiKey)}>
          {'\u2694\uFE0F'} Start Adventure!
        </button>
        <div style={{ fontSize: 6, color: '#444', marginTop: 12 }}>
          WASD/Arrows to move | B: Bag | C: Collection
        </div>
      </div>
      <div className="version-badge">Beta 1.0.0 | <a href="https://100t.xiaomimimo.com/" target="_blank" rel="noopener noreferrer">100T MiMo</a></div>
    </div>
  )
}

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState<GameScreen>('landing')
  const [player, setPlayer] = useState<PlayerState | null>(() => {
    const s = localStorage.getItem('mmt_player_v2')
    if (!s) return null
    try { return JSON.parse(s) } catch { return null }
  })
  const [collection, setCollection] = useState<Monster[]>(() => {
    const s = localStorage.getItem('mmt_collection_v2')
    if (!s) return []
    try { return JSON.parse(s) } catch { return [] }
  })
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mmt_apikey') || '')
  const [currentEnemy, setCurrentEnemy] = useState<Monster | null>(null)
  const [encounterFlash, setEncounterFlash] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeMonsterIndex, setActiveMonsterIndex] = useState(0)
  const [npcs] = useState<NpcDef[]>(() => spawnNpcs())
  const [activeNpc, setActiveNpc] = useState<NpcDef | null>(null)
  const [npcDialogIndex, setNpcDialogIndex] = useState(0)
  const [npcBattleNpc, setNpcBattleNpc] = useState<NpcDef | null>(null)
  const [defeatedNpcs, setDefeatedNpcs] = useState<Set<string>>(() => {
    const s = localStorage.getItem('mmt_defeated_npcs')
    if (!s) return new Set()
    try { return new Set(JSON.parse(s)) } catch { return new Set() }
  })

  useEffect(() => {
    if (player) localStorage.setItem('mmt_player_v2', JSON.stringify(player))
  }, [player])
  useEffect(() => {
    if (collection.length > 0) localStorage.setItem('mmt_collection_v2', JSON.stringify(collection))
  }, [collection])
  useEffect(() => {
    if (apiKey) localStorage.setItem('mmt_apikey', apiKey)
  }, [apiKey])

  const handleStart = (name: string, key: string) => {
    setApiKey(key)
    const existing = localStorage.getItem('mmt_player_v2')
    if (existing) {
      try {
        const p = JSON.parse(existing)
        if (p && p.name) { setPlayer(p); setScreen('map'); return }
      } catch { /* ignore */ }
    }
    setPlayer({
      name, level: 1, xp: 0, xpToNext: 100, gold: 200,
      monstersDefeated: 0, monstersCaptured: 0,
      inventory: [
        { itemId: 'potion', quantity: 5 },
        { itemId: 'capture_ball', quantity: 5 },
      ],
      activeMonsterIndex: 0,
    })
    setScreen('map')
  }

  const handleEncounter = async (elements: Element[], level: number) => {
    setEncounterFlash(true)
    setLoading(true)
    try {
      const mon = await generateMonster(apiKey, elements, level)
      setCurrentEnemy(mon)
      setTimeout(() => { setEncounterFlash(false); setScreen('battle'); setLoading(false) }, 600)
    } catch {
      setEncounterFlash(false)
      setLoading(false)
    }
  }

  const handleHeal = () => {
    if (!player) return
    setCollection(prev => prev.map(m => ({ ...m, hp: m.maxHp })))
  }

  const handleVictory = () => {
    if (!player || !currentEnemy) return
    const xpGain = 15 + currentEnemy.level * 8 +
      (currentEnemy.rarity === 'uncommon' ? 10 : currentEnemy.rarity === 'rare' ? 25 : currentEnemy.rarity === 'epic' ? 50 : currentEnemy.rarity === 'legendary' ? 100 : 0)
    const goldGain = 10 + currentEnemy.level * 5 + Math.floor(Math.random() * 15)
    let newXp = player.xp + xpGain
    let newLevel = player.level
    let newXpToNext = player.xpToNext
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext
      newLevel++
      newXpToNext = Math.floor(newXpToNext * 1.35)
    }
    setPlayer(prev => prev ? {
      ...prev, xp: newXp, level: newLevel, xpToNext: newXpToNext,
      gold: prev.gold + goldGain, monstersDefeated: prev.monstersDefeated + 1,
    } : prev)
    setCurrentEnemy(null)
    setScreen('map')
  }

  const handleDefeat = () => {
    setCurrentEnemy(null)
    setScreen('map')
  }

  const handleCapture = (mon: Monster) => {
    if (!player) return
    setCollection(prev => [...prev, mon])
    setPlayer(prev => prev ? { ...prev, monstersCaptured: prev.monstersCaptured + 1 } : prev)
    setCurrentEnemy(null)
    setScreen('map')
  }

  const handleUseItem = (itemId: string) => {
    if (!player) return
    setPlayer(prev => {
      if (!prev) return prev
      const inv = prev.inventory.map(s => s.itemId === itemId ? { ...s, quantity: s.quantity - 1 } : s)
      return { ...prev, inventory: inv }
    })
  }

  const handleBuyItem = (itemId: string) => {
    if (!player) return
    const item = getItem(itemId)
    if (!item || player.gold < item.price) return
    setPlayer(prev => {
      if (!prev) return prev
      const existing = prev.inventory.find(s => s.itemId === itemId)
      const inv = existing
        ? prev.inventory.map(s => s.itemId === itemId ? { ...s, quantity: s.quantity + 1 } : s)
        : [...prev.inventory, { itemId, quantity: 1 }]
      return { ...prev, gold: prev.gold - item.price, inventory: inv }
    })
  }

  const handleSellItem = (itemId: string) => {
    if (!player) return
    const item = getItem(itemId)
    if (!item) return
    const slot = player.inventory.find(s => s.itemId === itemId)
    if (!slot || slot.quantity <= 0) return
    setPlayer(prev => {
      if (!prev) return prev
      const inv = prev.inventory.map(s => s.itemId === itemId ? { ...s, quantity: s.quantity - 1 } : s)
      return { ...prev, gold: prev.gold + item.sellPrice, inventory: inv }
    })
  }

  const getPlayerMonster = (): Monster | null => {
    if (collection.length === 0) return null
    const idx = Math.min(activeMonsterIndex, collection.length - 1)
    return collection[idx]
  }

  const handleNpcInteract = (npc: NpcDef) => {
    if (activeNpc || screen !== 'map') return
    if (defeatedNpcs.has(npc.id)) {
      setActiveNpc(npc)
      setNpcDialogIndex(npc.dialog.length + 1)
      return
    }
    setActiveNpc(npc)
    setNpcDialogIndex(0)
  }

  const handleNpcNext = () => {
    if (!activeNpc) return
    if (defeatedNpcs.has(activeNpc.id)) { setActiveNpc(null); return }
    if (npcDialogIndex >= activeNpc.dialog.length) return
    setNpcDialogIndex(prev => prev + 1)
  }

  const handleNpcAcceptDuel = () => {
    if (!activeNpc) return
    setNpcBattleNpc(activeNpc)
    setCurrentEnemy({ ...activeNpc.monster })
    setActiveNpc(null)
    setEncounterFlash(true)
    setTimeout(() => { setEncounterFlash(false); setScreen('battle') }, 600)
  }

  const handleNpcDecline = () => { setActiveNpc(null) }

  const handleNpcVictory = () => {
    if (!player || !npcBattleNpc) { handleVictory(); return }
    const npc = npcBattleNpc
    setDefeatedNpcs(prev => {
      const next = new Set(prev)
      next.add(npc.id)
      localStorage.setItem('mmt_defeated_npcs', JSON.stringify([...next]))
      return next
    })
    const xpGain = 30 + npcBattleNpc.monster.level * 12
    const goldGain = 25 + npcBattleNpc.monster.level * 8
    let newXp = player.xp + xpGain
    let newLevel = player.level
    let newXpToNext = player.xpToNext
    while (newXp >= newXpToNext) { newXp -= newXpToNext; newLevel++; newXpToNext = Math.floor(newXpToNext * 1.35) }
    setPlayer(prev => prev ? {
      ...prev, xp: newXp, level: newLevel, xpToNext: newXpToNext,
      gold: prev.gold + goldGain, monstersDefeated: prev.monstersDefeated + 1,
    } : prev)
    setCurrentEnemy(null)
    setScreen('map')
    setActiveNpc({ ...npc })
    setNpcDialogIndex(npc.dialog.length + 1)
    setNpcBattleNpc(null)
  }

  const handleNpcDefeat = () => {
    setCurrentEnemy(null)
    setNpcBattleNpc(null)
    setScreen('map')
  }

  if (screen === 'landing' || !player) {
    return <LandingPage onStart={handleStart} />
  }

  return (<>
    {encounterFlash && <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 24 }}>{'\u2694\uFE0F'}</div>
      <div style={{ fontSize: 10 }}>Wild encounter!</div>
    </div>}
    {loading && !encounterFlash && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 8, color: '#fff' }}>Loading...</div>
    </div>}
    {screen === 'map' && <GameMap player={player} collection={collection} npcs={npcs}
      onEncounter={handleEncounter} onHeal={handleHeal}
      onOpenCollection={() => setScreen('collection')}
      onOpenInventory={() => setScreen('inventory')}
      onOpenShop={() => setScreen('shop_screen')}
      onBuyItem={handleBuyItem} onNpcInteract={handleNpcInteract} />}
    {screen === 'map' && activeNpc && (
      defeatedNpcs.has(activeNpc.id) ? (
        <div className="npc-dialog-overlay" onClick={() => setActiveNpc(null)}>
          <div className="npc-dialog slide-up">
            <div className="npc-dialog-header">
              <div className="npc-avatar" style={{ background: '#666' }}>{activeNpc.name.charAt(0)}</div>
              <div><div className="npc-name">{activeNpc.name}</div></div>
            </div>
            <div className="npc-chat-bubble">
              <div className="npc-chat-text">{activeNpc.defeatDialog}</div>
            </div>
            <div className="npc-duel-buttons">
              <button className="pixel-btn" onClick={() => setActiveNpc(null)}>OK</button>
            </div>
          </div>
        </div>
      ) : (
        <NpcDialog npc={activeNpc} dialogIndex={npcDialogIndex}
          onNext={handleNpcNext} onAcceptDuel={handleNpcAcceptDuel} onDecline={handleNpcDecline} />
      )
    )}
    {screen === 'battle' && currentEnemy && <BattleScene
      playerMonster={getPlayerMonster()} enemyMonster={currentEnemy}
      apiKey={apiKey} player={player}
      onVictory={npcBattleNpc ? handleNpcVictory : handleVictory}
      onDefeat={npcBattleNpc ? handleNpcDefeat : handleDefeat}
      onCapture={handleCapture} onUseItem={handleUseItem} />}
    {screen === 'collection' && <CollectionPage collection={collection}
      onClose={() => setScreen('map')} onSetActive={setActiveMonsterIndex}
      activeIndex={activeMonsterIndex} />}
    {screen === 'inventory' && <InventoryPage player={player} onClose={() => setScreen('map')} />}
    {screen === 'shop_screen' && <ShopPage player={player}
      onClose={() => setScreen('map')} onBuy={handleBuyItem} onSell={handleSellItem} />}
    <div className="version-badge">Beta 1.0.0 | <a href="https://100t.xiaomimimo.com/" target="_blank" rel="noopener noreferrer">100T MiMo</a></div>
  </>)
}
