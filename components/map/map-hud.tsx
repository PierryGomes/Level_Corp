"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Keyboard, Users, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { npcs } from "@/lib/map-data"
import { type UserRole, roleLabels } from "@/lib/mock-data"

interface Props {
  userName: string
  userRole: UserRole
}

export function MapHud({ userName, userRole }: Props) {
  const onlineCount = npcs.filter((n) => n.status === "online").length

  return (
    <>
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-border" />
          <Image
            src="/images/logo-levelcorp.jpeg"
            alt="LevelCorp"
            width={24}
            height={24}
            className="h-6 w-6 rounded"
          />
          <span className="text-sm font-bold text-foreground">LevelCorp</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineCount} online</span>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {roleLabels[userRole]}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
        <Keyboard className="h-3.5 w-3.5" />
        <span>WASD ou setas para mover | Enter para conversar</span>
      </div>

      {/* Legend */}
      <div className="absolute right-4 top-[68px] z-20 flex flex-col gap-1.5 rounded-lg border border-border bg-card/90 px-3 py-2.5 text-xs shadow-lg backdrop-blur-sm">
        <span className="mb-0.5 font-semibold text-foreground">Legenda</span>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#3B82F6" }} />
          <span className="text-muted-foreground">Colaborador</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
          <span className="text-muted-foreground">Gestor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#EAB308" }} />
          <span className="text-muted-foreground">CEO</span>
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Ausente</span>
          </div>
        </div>
      </div>
    </>
  )
}
