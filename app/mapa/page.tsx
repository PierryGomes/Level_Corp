"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { type MockUser } from "@/lib/mock-data"
import { type NPC } from "@/lib/map-data"
import { OfficeMap } from "@/components/map/office-map"
import { MapHud } from "@/components/map/map-hud"
import { ProximityChat } from "@/components/chat/proximity-chat"

export default function MapaPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)
  const [chatNpc, setChatNpc] = useState<NPC | null>(null)
  const [nearNpc, setNearNpc] = useState<NPC | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    try {
      setUser(JSON.parse(stored))
    } catch {
      router.push("/login")
    }
  }, [router])

  const handleNpcProximity = useCallback((npc: NPC | null) => {
    setNearNpc(npc)
    // Auto-close chat if player walks away from the NPC being chatted with
    if (!npc && chatNpc) {
      // Keep chat open even if player moves slightly, only close if they leave radius
    }
  }, [chatNpc])

  const handleEnterChat = useCallback((npc: NPC) => {
    setChatNpc(npc)
  }, [])

  const handleCloseChat = useCallback(() => {
    setChatNpc(null)
  }, [])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const spawnPositions: Record<string, { x: number; y: number }> = {
    ceo: { x: 32, y: 23 },
    gestor: { x: 10, y: 6 },
    colaborador: { x: 10, y: 2 },
  }
  const spawn = spawnPositions[user.role] ?? spawnPositions.colaborador

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapHud userName={user.name} userRole={user.role} />
      <div className="h-full w-full pt-14">
        <OfficeMap
          playerName={user.name}
          playerInitials={user.avatar}
          playerRole={user.role}
          startTileX={spawn.x}
          startTileY={spawn.y}
          onNpcProximity={handleNpcProximity}
          onEnterChat={handleEnterChat}
        />
      </div>

      {/* Proximity chat panel */}
      {chatNpc && (
        <ProximityChat npc={chatNpc} onClose={handleCloseChat} />
      )}
    </div>
  )
}
