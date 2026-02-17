"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  LogOut,
  Trophy,
  Target,
  Coins,
  Users,
  BarChart3,
  TrendingUp,
  Star,
  Zap,
  Crown,
  Map,
  MessageSquare,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { type MockUser, type UserRole, roleLabels } from "@/lib/mock-data"

function MapEntryCard() {
  return (
    <Link href="/mapa">
      <div className="group relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-5 transition-all hover:border-primary/50 hover:bg-primary/10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Entrar no Escritorio Virtual</h3>
            <p className="text-sm text-muted-foreground">
              Explore o andar corporativo, encontre colegas e interaja com sua equipe
            </p>
          </div>
          <div className="text-primary transition-transform group-hover:translate-x-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ChatEntryCard() {
  return (
    <Link href="/chat">
      <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
            <MessageSquare className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Hub de Comunicacao</h3>
            <p className="text-sm text-muted-foreground">
              Chat, canais, tarefas, calendario, chamadas e arquivos
            </p>
          </div>
          <div className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function StoreEntryCard() {
  return (
    <Link href="/loja">
      <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Loja de Recompensas</h3>
            <p className="text-sm text-muted-foreground">
              Troque seus LevelCoins por beneficios exclusivos
            </p>
          </div>
          <div className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface Mission {
  id: string
  title: string
  xp: number
  coins: number
  current: number
  total: number
  unit: string
  completed: boolean
}

const initialMissions: Mission[] = [
  { id: "m1", title: "Completar curso de lideranca", xp: 300, coins: 75, current: 2, total: 5, unit: "modulos", completed: false },
  { id: "m2", title: "Participar de 3 reunioes esta semana", xp: 200, coins: 50, current: 1, total: 3, unit: "reunioes", completed: false },
  { id: "m3", title: "Streak de 5 dias consecutivos", xp: 500, coins: 100, current: 3, total: 5, unit: "dias", completed: false },
  { id: "m4", title: "Enviar feedback para 2 colegas", xp: 150, coins: 40, current: 0, total: 2, unit: "feedbacks", completed: false },
  { id: "m5", title: "Visitar todos os departamentos no mapa", xp: 250, coins: 60, current: 2, total: 5, unit: "departamentos", completed: false },
]

function ColaboradorDashboard({ user }: { user: MockUser }) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [xp, setXp] = useState(user.xp)
  const [coins, setCoins] = useState(user.coins)
  const [level, setLevel] = useState(user.level)
  const [xpToNext, setXpToNext] = useState(user.xpToNext)
  const [toast, setToast] = useState<string | null>(null)
  const xpPercent = Math.round((xp / xpToNext) * 100)

  const activeMissions = missions.filter((m) => !m.completed)
  const completedCount = missions.filter((m) => m.completed).length

  function advanceMission(id: string) {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== id || m.completed) return m
        const next = m.current + 1
        if (next >= m.total) {
          // Complete the mission
          setXp((x) => {
            const newXp = x + m.xp
            if (newXp >= xpToNext) {
              setLevel((l) => l + 1)
              setXpToNext((n) => Math.round(n * 1.3))
            }
            return newXp
          })
          setCoins((c) => c + m.coins)
          setToast(`Missao completa! +${m.xp} XP +${m.coins} Moedas`)
          setTimeout(() => setToast(null), 3000)
          return { ...m, current: next, completed: true }
        }
        return { ...m, current: next }
      })
    )
  }

  return (
    <div className="relative space-y-6">
      {/* XP Toast */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-2xl animate-in fade-in zoom-in duration-200">
          {toast}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MapEntryCard />
        <ChatEntryCard />
        <StoreEntryCard />
      </div>
      {/* Welcome + XP */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Ola, {user.name.split(" ")[0]}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Level {level} - {user.department}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Star className="h-4 w-4" />
              {xp.toLocaleString()} XP
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-foreground">
              <Coins className="h-4 w-4" />
              {coins}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progresso para Level {level + 1}</span>
            <span>{xpPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(xpPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeMissions.length}</p>
          <p className="text-sm text-muted-foreground">Missoes Ativas</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{12 + completedCount}</p>
          <p className="text-sm text-muted-foreground">Conquistas</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">#4</p>
          <p className="text-sm text-muted-foreground">No Ranking</p>
        </div>
      </div>

      {/* Missions */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Missoes em Andamento</h3>
        <div className="space-y-3">
          {missions.map((mission) => {
            const percent = Math.round((mission.current / mission.total) * 100)
            return (
              <div
                key={mission.id}
                className={`rounded-lg border p-3 transition-all ${
                  mission.completed
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border/50 bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    mission.completed ? "bg-green-500/10" : "bg-primary/10"
                  }`}>
                    {mission.completed ? (
                      <Trophy className="h-4 w-4 text-green-500" />
                    ) : (
                      <Zap className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${mission.completed ? "text-green-600 line-through dark:text-green-400" : "text-foreground"}`}>
                      {mission.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{mission.xp} XP | +{mission.coins} Moedas
                    </p>
                  </div>
                  {mission.completed ? (
                    <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                      Completa!
                    </span>
                  ) : (
                    <button
                      onClick={() => advanceMission(mission.id)}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {mission.current}/{mission.total} {mission.unit}
                    </button>
                  )}
                </div>
                {!mission.completed && (
                  <div className="mt-2 ml-12">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GestorDashboard({ user }: { user: MockUser }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MapEntryCard />
        <ChatEntryCard />
        <StoreEntryCard />
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="text-xl font-bold text-foreground">
          Painel do Gestor - {user.department}
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe o desempenho e engajamento da sua equipe
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Colaboradores", value: "24", icon: Users },
          { label: "Engajamento", value: "87%", icon: TrendingUp },
          { label: "Missoes Completas", value: "142", icon: Target },
          { label: "Satisfacao", value: "4.6/5", icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Team ranking */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Ranking da Equipe</h3>
        <div className="space-y-3">
          {[
            { name: "Ana Silva", level: 7, xp: 2340, position: 1 },
            { name: "Pedro Santos", level: 6, xp: 2100, position: 2 },
            { name: "Maria Costa", level: 6, xp: 1980, position: 3 },
            { name: "Lucas Ferreira", level: 5, xp: 1750, position: 4 },
            { name: "Julia Oliveira", level: 5, xp: 1620, position: 5 },
          ].map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                member.position <= 3
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {member.position}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">Level {member.level}</p>
              </div>
              <span className="text-sm font-semibold text-primary">
                {member.xp.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CeoDashboard({ user }: { user: MockUser }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MapEntryCard />
        <ChatEntryCard />
        <StoreEntryCard />
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Visao Executiva
            </h2>
            <p className="text-sm text-muted-foreground">
              Bem-vindo, {user.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Colaboradores", value: "156", icon: Users },
          { label: "Engajamento Global", value: "82%", icon: TrendingUp },
          { label: "Departamentos", value: "8", icon: BarChart3 },
          { label: "ROI Estimado", value: "+340%", icon: Coins },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Department overview */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Desempenho por Departamento</h3>
        <div className="space-y-4">
          {[
            { dept: "Tecnologia", engagement: 92, members: 32 },
            { dept: "Marketing", engagement: 88, members: 18 },
            { dept: "Vendas", engagement: 85, members: 28 },
            { dept: "RH", engagement: 79, members: 12 },
            { dept: "Financeiro", engagement: 74, members: 15 },
          ].map((dept) => (
            <div key={dept.dept} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{dept.dept}</span>
                <span className="text-muted-foreground">
                  {dept.engagement}% | {dept.members} pessoas
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${dept.engagement}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top departments */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Top Colaboradores</h3>
          <div className="space-y-3">
            {[
              { name: "Ana Silva", dept: "Tecnologia", xp: 2340 },
              { name: "Pedro Santos", dept: "Tecnologia", xp: 2100 },
              { name: "Carla Lima", dept: "Marketing", xp: 2050 },
            ].map((person, i) => (
              <div key={person.name} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.dept}</p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  {person.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Metricas Chave</h3>
          <div className="space-y-4">
            {[
              { label: "Turnover (mensal)", value: "2.1%", trend: "-0.8%" },
              { label: "NPS Interno", value: "72", trend: "+5" },
              { label: "Missoes Completadas/Semana", value: "284", trend: "+12%" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                  <span className="text-xs font-medium text-green-500">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const dashboardMap: Record<UserRole, React.ComponentType<{ user: MockUser }>> = {
  colaborador: ColaboradorDashboard,
  gestor: GestorDashboard,
  ceo: CeoDashboard,
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)

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

  function handleLogout() {
    localStorage.removeItem("levelcorp_user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const DashboardComponent = dashboardMap[user.role]

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="LevelCorp"
              width={140}
              height={36}
              className="h-7 w-auto"
            />
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {roleLabels[user.role]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <DashboardComponent user={user} />
      </main>
    </div>
  )
}
