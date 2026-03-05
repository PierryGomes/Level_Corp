"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface PlayerPresence {
  odac_id: string
  nome: string
  cargo: string
  x: number
  y: number
  direction: "up" | "down" | "left" | "right"
  online_at: string
}

interface UsePresenceOptions {
  roomName?: string
  currentPlayer: {
    odac_id: string
    nome: string
    cargo: string
  }
}

export function usePresence({ roomName = "mapa-virtual", currentPlayer }: UsePresenceOptions) {
  const [remotePlayers, setRemotePlayers] = useState<Map<string, PlayerPresence>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())
  const currentPositionRef = useRef({ x: 400, y: 300, direction: "down" as const })

  // Broadcast position update to all connected clients
  const broadcastPosition = useCallback((x: number, y: number, direction: "up" | "down" | "left" | "right") => {
    currentPositionRef.current = { x, y, direction }
    
    if (channelRef.current) {
      channelRef.current.track({
        odac_id: currentPlayer.odac_id,
        nome: currentPlayer.nome,
        cargo: currentPlayer.cargo,
        x,
        y,
        direction,
        online_at: new Date().toISOString(),
      })
    }
  }, [currentPlayer])

  // Initialize presence channel
  useEffect(() => {
    const supabase = supabaseRef.current
    
    // Create the presence channel
    const channel = supabase.channel(roomName, {
      config: {
        presence: {
          key: currentPlayer.odac_id,
        },
      },
    })

    channelRef.current = channel

    // Handle presence sync (initial state and updates)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PlayerPresence>()
      const players = new Map<string, PlayerPresence>()
      
      Object.entries(state).forEach(([key, presences]) => {
        // Skip current player
        if (key === currentPlayer.odac_id) return
        
        // Get the most recent presence for this user
        const latestPresence = presences[presences.length - 1]
        if (latestPresence) {
          players.set(key, latestPresence)
        }
      })
      
      setRemotePlayers(players)
    })

    // Handle new player joining
    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (key === currentPlayer.odac_id) return
      
      const latestPresence = newPresences[newPresences.length - 1] as PlayerPresence
      if (latestPresence) {
        setRemotePlayers(prev => {
          const next = new Map(prev)
          next.set(key, latestPresence)
          return next
        })
      }
    })

    // Handle player leaving
    channel.on("presence", { event: "leave" }, ({ key }) => {
      setRemotePlayers(prev => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    })

    // Subscribe and track initial presence
    channel
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          setConnectionError(null)
          
          // Track initial presence
          await channel.track({
            odac_id: currentPlayer.odac_id,
            nome: currentPlayer.nome,
            cargo: currentPlayer.cargo,
            x: currentPositionRef.current.x,
            y: currentPositionRef.current.y,
            direction: currentPositionRef.current.direction,
            online_at: new Date().toISOString(),
          })
        } else if (status === "CHANNEL_ERROR") {
          setConnectionError("Erro ao conectar ao servidor")
          setIsConnected(false)
        } else if (status === "TIMED_OUT") {
          setConnectionError("Conexão expirou")
          setIsConnected(false)
        }
      })

    // Cleanup on unmount
    return () => {
      channel.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
    }
  }, [roomName, currentPlayer])

  return {
    remotePlayers: Array.from(remotePlayers.values()),
    isConnected,
    connectionError,
    broadcastPosition,
    onlineCount: remotePlayers.size + 1, // Include current player
  }
}
