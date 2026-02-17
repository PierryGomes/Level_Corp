"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import {
  TILE, COLS, ROWS, MAP_W, MAP_H,
  rooms, npcs, furniture, isWall, getNpcNear,
  type NPC, type Room, type DeptPerformance,
} from "@/lib/map-data"

interface Props {
  playerName: string
  playerInitials: string
  playerRole: "colaborador" | "gestor" | "ceo"
  startTileX?: number
  startTileY?: number
  onNpcProximity?: (npc: NPC | null) => void
  onEnterChat?: (npc: NPC) => void
}

// ── Performance glow colors ──
const perfGlow: Record<DeptPerformance, string> = {
  green: "rgba(34,197,94,0.08)",
  yellow: "rgba(234,179,8,0.08)",
  red: "rgba(239,68,68,0.08)",
}
const perfBorder: Record<DeptPerformance, string> = {
  green: "rgba(34,197,94,0.4)",
  yellow: "rgba(234,179,8,0.4)",
  red: "rgba(239,68,68,0.4)",
}

// ── Speech bubble snippets per NPC ──
const speechSnippets: Record<string, string[]> = {
  "ceo1": ["Bom trabalho!", "Foco nos resultados!", "Excelente!"],
  "tec_mgr": ["Sprint indo bem!", "Revisem os PRs!", "Otimo ritmo!"],
  "tec1": ["Refactoring...", "Review please!", "Quase pronto!"],
  "tec2": ["Debugando...", "Fix commitada!", "API otimizada!"],
  "tec3": ["Deploy em 3..2..1", "Pipeline verde!", "CI/CD ok!"],
  "mkt_mgr": ["Meta em vista!", "Numeros otimos!", "Campanha top!"],
  "mkt1": ["Post agendado!", "Engajamento alto!", "Tendencia ok!"],
  "ven_mgr": ["Foco total!", "Meta batavel!", "Vamos fechar!"],
  "ven1": ["Deal fechado!", "Cliente feliz!", "120k ARR!"],
  "rh_mgr": ["Pesquisa aberta!", "Clima melhorou!", "NPS subiu!"],
  "fin_mgr": ["Conciliacao ok!", "Budget aprovado!", "ROI positivo!"],
}

export function OfficeMap({ playerName, playerInitials, playerRole, startTileX = 10, startTileY = 2, onNpcProximity, onEnterChat }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  const posRef = useRef({ x: startTileX, y: startTileY })
  const targetRef = useRef({ x: startTileX, y: startTileY })
  const keysRef = useRef<Set<string>>(new Set())
  const moveTimer = useRef(0)
  const camRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef({ w: 0, h: 0 })

  const [hoveredNpc, setHoveredNpc] = useState<NPC | null>(null)
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 })
  const [currentRoom, setCurrentRoom] = useState("")
  const nearNpcRef = useRef<NPC | null>(null)

  // Speech bubble state: which NPCs are currently "speaking"
  const bubbleState = useRef<Map<string, { text: string; until: number }>>(new Map())

  // ── Resize handler ──
  useEffect(() => {
    function handleResize() {
      const el = wrapRef.current
      const cvs = canvasRef.current
      if (!el || !cvs) return
      const w = el.clientWidth
      const h = el.clientHeight
      cvs.width = w
      cvs.height = h
      sizeRef.current = { w, h }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ── Speech bubble cycling ──
  useEffect(() => {
    function cycleBubbles() {
      const now = Date.now()
      const map = bubbleState.current

      // Remove expired
      for (const [k, v] of map) {
        if (now > v.until) map.delete(k)
      }

      // Add new random bubbles (2-4 NPCs at a time)
      const candidates = Object.keys(speechSnippets).filter((id) => !map.has(id))
      const count = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < Math.min(count, candidates.length); i++) {
        const idx = Math.floor(Math.random() * candidates.length)
        const npcId = candidates.splice(idx, 1)[0]
        const snippets = speechSnippets[npcId]
        const text = snippets[Math.floor(Math.random() * snippets.length)]
        map.set(npcId, { text, until: now + 3000 + Math.random() * 2000 })
      }
    }

    cycleBubbles()
    const interval = setInterval(cycleBubbles, 4000)
    return () => clearInterval(interval)
  }, [])

  // ── Key handlers ──
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) {
        e.preventDefault()
        keysRef.current.add(e.key)
      }
      if (e.key === "Enter" && nearNpcRef.current && onEnterChat) {
        e.preventDefault()
        onEnterChat(nearNpcRef.current)
      }
    }
    function up(e: KeyboardEvent) { keysRef.current.delete(e.key) }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  }, [onEnterChat])

  // ── Drawing helpers ──
  const drawFloor = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const baseFloor = dark ? "#1e293b" : "#f1f5f9"
    ctx.fillStyle = baseFloor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    for (const room of rooms) {
      const rx = room.x * TILE - ox
      const ry = room.y * TILE - oy
      const rw = room.w * TILE
      const rh = room.h * TILE

      ctx.fillStyle = dark ? room.darkColor : room.color
      ctx.fillRect(rx, ry, rw, rh)

      if (room.performance) {
        ctx.fillStyle = perfGlow[room.performance]
        ctx.fillRect(rx, ry, rw, rh)
        ctx.strokeStyle = perfBorder[room.performance]
        ctx.lineWidth = 2
        ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2)
      }

      ctx.strokeStyle = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      ctx.strokeRect(rx, ry, rw, rh)

      ctx.fillStyle = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"
      ctx.font = "bold 11px 'Geist', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(room.label, rx + rw / 2, ry + 14)
    }

    ctx.strokeStyle = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * TILE - ox, -oy)
      ctx.lineTo(x * TILE - ox, MAP_H - oy)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(-ox, y * TILE - oy)
      ctx.lineTo(MAP_W - ox, y * TILE - oy)
      ctx.stroke()
    }

    for (let ty = 0; ty < ROWS; ty++) {
      for (let tx = 0; tx < COLS; tx++) {
        if (isWall(tx, ty)) {
          ctx.fillStyle = dark ? "#0f172a" : "#cbd5e1"
          ctx.fillRect(tx * TILE - ox, ty * TILE - oy, TILE, TILE)
        }
      }
    }
  }, [dark])

  const drawFurniture = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const f of furniture) {
      const fx = f.tileX * TILE - ox + TILE / 2
      const fy = f.tileY * TILE - oy + TILE / 2
      switch (f.type) {
        case "desk":
          ctx.fillStyle = dark ? "#4a3728" : "#a67c52"
          ctx.fillRect(fx - 12, fy - 6, 24, 12)
          ctx.strokeStyle = dark ? "#5c4533" : "#8b6343"
          ctx.lineWidth = 1
          ctx.strokeRect(fx - 12, fy - 6, 24, 12)
          break
        case "chair":
          ctx.fillStyle = dark ? "#374151" : "#6b7280"
          ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill()
          break
        case "plant":
          ctx.fillStyle = dark ? "#166534" : "#22c55e"
          ctx.beginPath(); ctx.arc(fx, fy - 2, 7, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = dark ? "#4a3728" : "#92400e"
          ctx.fillRect(fx - 3, fy + 4, 6, 6)
          break
        case "trophy":
          ctx.fillStyle = "#EAB308"
          ctx.beginPath()
          ctx.moveTo(fx, fy - 8); ctx.lineTo(fx + 6, fy - 2); ctx.lineTo(fx + 4, fy + 4)
          ctx.lineTo(fx - 4, fy + 4); ctx.lineTo(fx - 6, fy - 2); ctx.closePath(); ctx.fill()
          ctx.fillStyle = dark ? "#854d0e" : "#ca8a04"
          ctx.fillRect(fx - 3, fy + 4, 6, 4)
          break
        case "whiteboard":
          ctx.fillStyle = dark ? "#334155" : "#e2e8f0"
          ctx.fillRect(fx - 14, fy - 10, 28, 20)
          ctx.strokeStyle = dark ? "#475569" : "#94a3b8"
          ctx.lineWidth = 2; ctx.strokeRect(fx - 14, fy - 10, 28, 20)
          break
        case "sofa":
          ctx.fillStyle = dark ? "#3730a3" : "#818cf8"
          roundRect(ctx, fx - 12, fy - 5, 24, 10, 4); ctx.fill()
          break
        case "podium":
          ctx.fillStyle = dark ? "#4a3728" : "#92400e"
          ctx.fillRect(fx - 6, fy - 10, 12, 20)
          ctx.fillStyle = dark ? "#5c4533" : "#a67c52"
          ctx.fillRect(fx - 8, fy - 12, 16, 4)
          break
        case "screen":
          ctx.fillStyle = dark ? "#1e293b" : "#0f172a"
          ctx.fillRect(fx - 14, fy - 10, 28, 18)
          ctx.fillStyle = dark ? "#38bdf8" : "#0ea5e9"
          ctx.fillRect(fx - 12, fy - 8, 24, 14)
          break
      }
    }
  }, [dark])

  const drawNpcs = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    for (const npc of npcs) {
      const nx = npc.tileX * TILE - ox + TILE / 2
      const ny = npc.tileY * TILE - oy + TILE / 2

      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.beginPath(); ctx.ellipse(nx, ny + 12, 10, 4, 0, 0, Math.PI * 2); ctx.fill()

      const bob = Math.sin(time * 0.003 + npc.tileX) * 1.5

      ctx.fillStyle = npc.avatarColor
      ctx.beginPath(); ctx.arc(nx, ny - 2 + bob, 12, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1.5; ctx.stroke()

      ctx.fillStyle = "#fff"
      ctx.font = "bold 9px 'Geist', sans-serif"
      ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(npc.initials, nx, ny - 1 + bob)

      if (npc.isCeo) {
        ctx.fillStyle = "#EAB308"
        ctx.beginPath()
        ctx.moveTo(nx - 6, ny - 16 + bob); ctx.lineTo(nx - 4, ny - 12 + bob)
        ctx.lineTo(nx, ny - 15 + bob); ctx.lineTo(nx + 4, ny - 12 + bob)
        ctx.lineTo(nx + 6, ny - 16 + bob); ctx.lineTo(nx + 7, ny - 10 + bob)
        ctx.lineTo(nx - 7, ny - 10 + bob); ctx.closePath(); ctx.fill()
      } else if (npc.isManager) {
        ctx.fillStyle = "#a78bfa"
        drawStar(ctx, nx + 9, ny - 10 + bob, 4, 5)
      }

      const statusColors: Record<string, string> = { online: "#22c55e", busy: "#ef4444", away: "#eab308" }
      ctx.fillStyle = statusColors[npc.status] ?? "#22c55e"
      ctx.beginPath(); ctx.arc(nx + 10, ny + 5 + bob, 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dark ? "#1e293b" : "#fff"
      ctx.lineWidth = 1.5; ctx.stroke()

      // ── Speech bubbles ──
      const bubble = bubbleState.current.get(npc.id)
      if (bubble) {
        const bx = nx
        const by = ny - 28 + bob

        ctx.font = "10px 'Geist', sans-serif"
        const textWidth = ctx.measureText(bubble.text).width
        const padX = 8
        const padY = 5
        const bw = textWidth + padX * 2
        const bh = 16 + padY

        // Bubble background
        ctx.fillStyle = dark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)"
        ctx.strokeStyle = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
        ctx.lineWidth = 1
        roundRect(ctx, bx - bw / 2, by - bh, bw, bh, 8)
        ctx.fill(); ctx.stroke()

        // Tail triangle
        ctx.fillStyle = dark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.95)"
        ctx.beginPath()
        ctx.moveTo(bx - 4, by); ctx.lineTo(bx + 4, by); ctx.lineTo(bx, by + 5)
        ctx.closePath(); ctx.fill()

        // Text
        ctx.fillStyle = dark ? "#e2e8f0" : "#1e293b"
        ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillText(bubble.text, bx, by - bh / 2)
      }
    }
  }, [dark])

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, ox: number, oy: number, time: number) => {
    const pos = posRef.current
    const px = pos.x * TILE - ox + TILE / 2
    const py = pos.y * TILE - oy + TILE / 2
    const bob = Math.sin(time * 0.004) * 1

    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.beginPath(); ctx.ellipse(px, py + 13, 11, 5, 0, 0, Math.PI * 2); ctx.fill()

    ctx.strokeStyle = "#EAB308"
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(px, py - 2 + bob, 15, 0, Math.PI * 2); ctx.stroke()

    const playerColor = playerRole === "ceo" ? "#EAB308" : playerRole === "gestor" ? "#8B5CF6" : "#3B82F6"
    ctx.fillStyle = playerColor
    ctx.beginPath(); ctx.arc(px, py - 2 + bob, 13, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke()

    ctx.fillStyle = "#fff"
    ctx.font = "bold 10px 'Geist', sans-serif"
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(playerInitials, px, py - 1 + bob)

    ctx.fillStyle = dark ? "#e2e8f0" : "#1e293b"
    ctx.font = "bold 10px 'Geist', sans-serif"
    ctx.fillText(playerName.split(" ")[0], px, py - 22 + bob)
  }, [dark, playerInitials, playerName, playerRole])

  const drawMinimap = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    const mw = 160
    const mh = (ROWS / COLS) * mw
    const mx = cw - mw - 12
    const my = ch - mh - 12
    const sx = mw / COLS
    const sy = mh / ROWS

    ctx.fillStyle = dark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)"
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
    ctx.lineWidth = 1
    roundRect(ctx, mx - 4, my - 4, mw + 8, mh + 8, 8)
    ctx.fill(); ctx.stroke()

    for (const room of rooms) {
      ctx.fillStyle = dark ? room.darkColor : room.color
      ctx.fillRect(mx + room.x * sx, my + room.y * sy, room.w * sx, room.h * sy)
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      ctx.lineWidth = 0.5
      ctx.strokeRect(mx + room.x * sx, my + room.y * sy, room.w * sx, room.h * sy)
    }

    for (const npc of npcs) {
      ctx.fillStyle = npc.isCeo ? "#EAB308" : npc.isManager ? "#8B5CF6" : "#3B82F6"
      ctx.beginPath(); ctx.arc(mx + npc.tileX * sx, my + npc.tileY * sy, 2, 0, Math.PI * 2); ctx.fill()
    }

    const pos = posRef.current
    ctx.fillStyle = "#EAB308"
    ctx.beginPath(); ctx.arc(mx + pos.x * sx, my + pos.y * sy, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke()

    const cam = camRef.current
    const sz = sizeRef.current
    ctx.strokeStyle = "rgba(234,179,8,0.6)"
    ctx.lineWidth = 1
    ctx.strokeRect(mx + (cam.x / TILE) * sx, my + (cam.y / TILE) * sy, (sz.w / TILE) * sx, (sz.h / TILE) * sy)
  }, [dark])

  // ── Game loop ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId = 0

    function loop(time: number) {
      const ctx = canvas!.getContext("2d")
      if (!ctx) return
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { animId = requestAnimationFrame(loop); return }

      const keys = keysRef.current
      const now = performance.now()
      if (now - moveTimer.current > 120) {
        moveTimer.current = now
        let dx = 0, dy = 0
        if (keys.has("ArrowLeft") || keys.has("a")) dx = -1
        if (keys.has("ArrowRight") || keys.has("d")) dx = 1
        if (keys.has("ArrowUp") || keys.has("w")) dy = -1
        if (keys.has("ArrowDown") || keys.has("s")) dy = 1
        if (dx !== 0 || dy !== 0) {
          const nx = targetRef.current.x + dx
          const ny = targetRef.current.y + dy
          if (!isWall(nx, ny)) targetRef.current = { x: nx, y: ny }
        }
      }

      const pos = posRef.current
      const tgt = targetRef.current
      pos.x += (tgt.x - pos.x) * 0.25
      pos.y += (tgt.y - pos.y) * 0.25

      const cam = camRef.current
      const targetCamX = pos.x * TILE - w / 2 + TILE / 2
      const targetCamY = pos.y * TILE - h / 2 + TILE / 2
      cam.x += (targetCamX - cam.x) * 0.1
      cam.y += (targetCamY - cam.y) * 0.1
      cam.x = Math.max(0, Math.min(MAP_W - w, cam.x))
      cam.y = Math.max(0, Math.min(MAP_H - h, cam.y))

      const near = getNpcNear(tgt.x, tgt.y, 2)
      nearNpcRef.current = near
      if (near) {
        setHoveredNpc(near)
        setPopupPos({
          x: near.tileX * TILE - cam.x + TILE / 2,
          y: near.tileY * TILE - cam.y - 30,
        })
        onNpcProximity?.(near)
      } else {
        setHoveredNpc(null)
        onNpcProximity?.(null)
      }

      const roomsAtPlayer = rooms.find(
        r => tgt.x >= r.x && tgt.x < r.x + r.w && tgt.y >= r.y && tgt.y < r.y + r.h
      )
      setCurrentRoom(roomsAtPlayer?.label ?? "")

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      drawFloor(ctx, cam.x, cam.y)
      drawFurniture(ctx, cam.x, cam.y)
      drawNpcs(ctx, cam.x, cam.y, time)
      drawPlayer(ctx, cam.x, cam.y, time)
      ctx.restore()
      drawMinimap(ctx, w, h)

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [drawFloor, drawFurniture, drawNpcs, drawPlayer, drawMinimap, onNpcProximity])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-background" tabIndex={0}>
      <canvas ref={canvasRef} className="block h-full w-full" />

      {hoveredNpc && (
        <div
          className="pointer-events-none absolute z-30 min-w-[220px] rounded-lg border border-border bg-card p-3 shadow-xl"
          style={{ left: popupPos.x, top: popupPos.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: hoveredNpc.avatarColor }}
            >
              {hoveredNpc.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{hoveredNpc.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredNpc.role}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{hoveredNpc.department}</span>
            <span className="font-semibold text-primary">Lv.{hoveredNpc.level}</span>
            <span>{hoveredNpc.xp.toLocaleString()} XP</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: hoveredNpc.status === "online" ? "#22c55e" : hoveredNpc.status === "busy" ? "#ef4444" : "#eab308" }}
            />
            <span className="capitalize text-muted-foreground">{hoveredNpc.status}</span>
          </div>
          <div className="mt-2 rounded-md bg-primary/10 px-2 py-1 text-center text-[10px] font-medium text-primary">
            Pressione Enter para conversar
          </div>
        </div>
      )}

      {currentRoom && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm">
          {currentRoom}
        </div>
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.4
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath(); ctx.fill()
}
