"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Coins,
  Star,
  ShoppingBag,
  Lock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Shirt,
  Crown,
  LayoutGrid,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { type MockUser, roleLabels } from "@/lib/mock-data"
import {
  type StoreCategory,
  type RewardItem,
  type PurchaseRecord,
  categoryLabels,
  storeItems,
  getItemsByCategory,
  canPurchase,
  getMockPurchaseHistory,
  getTeamPurchases,
  getStoreDashboardStats,
} from "@/lib/store-data"

const categoryIconMap: Record<StoreCategory, React.ReactNode> = {
  all: <LayoutGrid className="h-4 w-4" />,
  experiencias: <Sparkles className="h-4 w-4" />,
  educacao: <BookOpen className="h-4 w-4" />,
  lifestyle: <Shirt className="h-4 w-4" />,
  exclusivos: <Crown className="h-4 w-4" />,
}

const statusLabels: Record<string, { label: string; className: string }> = {
  resgatado: { label: "Resgatado", className: "bg-primary/10 text-primary" },
  pendente: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  utilizado: { label: "Utilizado", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
}

// ─── Confirmation Modal ───
function ConfirmDialog({
  item,
  userCoins,
  onConfirm,
  onCancel,
}: {
  item: RewardItem
  userCoins: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const remaining = userCoins - item.price

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground">Confirmar Resgate</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tem certeza que deseja resgatar este item?
        </p>

        <div className="mt-5 rounded-xl border border-border/50 bg-background p-4">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Preco</span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Coins className="h-3.5 w-3.5 text-primary" />
              {item.price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Saldo atual</span>
            <span className="font-semibold text-foreground">{userCoins.toLocaleString()}</span>
          </div>
          <div className="border-t border-border/50 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Saldo apos resgate</span>
              <span className={`font-bold ${remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onConfirm}>
            Confirmar Resgate
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Success Animation ───
function SuccessOverlay({ itemName, onClose }: { itemName: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <h3 className="mt-4 text-xl font-bold text-foreground">Resgate Confirmado!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{itemName}</span> foi adicionado aos seus resgates.
        </p>
        <div className="mt-3 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Reward Card ───
function RewardCard({
  item,
  userCoins,
  userLevel,
  onRedeem,
}: {
  item: RewardItem
  userCoins: number
  userLevel: number
  onRedeem: (item: RewardItem) => void
}) {
  const { ok, reason } = canPurchase(item, userCoins, userLevel)
  const levelLocked = userLevel < item.levelRequired

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all ${
        levelLocked
          ? "border-border/30 bg-card/50 opacity-70"
          : "border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Tags */}
      {item.tag && (
        <div className="absolute right-3 top-3 z-10">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              item.tag === "Lendario"
                ? "bg-amber-500/10 text-amber-500"
                : item.tag === "Raro"
                  ? "bg-red-500/10 text-red-500"
                  : item.tag === "Premium"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-primary/10 text-primary"
            }`}
          >
            {item.tag}
          </span>
        </div>
      )}
      {item.popular && !item.tag && (
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            Popular
          </span>
        </div>
      )}

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Icon area */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
            levelLocked ? "bg-muted" : "bg-primary/10"
          }`}
        >
          {levelLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ShoppingBag className={`h-5 w-5 ${levelLocked ? "text-muted-foreground" : "text-primary"}`} />
          )}
        </div>

        <h3 className="font-semibold text-foreground">{item.name}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.stock !== null && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                item.stock <= 3
                  ? "bg-red-500/10 text-red-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.stock <= 0 ? "Esgotado" : `${item.stock} restantes`}
            </span>
          )}
          {levelLocked && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              Level {item.levelRequired}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-base font-bold text-foreground">{item.price.toLocaleString()}</span>
        </div>
        <Button
          size="sm"
          disabled={!ok}
          onClick={() => onRedeem(item)}
          className={
            ok
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed opacity-50"
          }
        >
          {levelLocked ? "Bloqueado" : !ok ? (reason ?? "Indisponivel") : "Resgatar"}
        </Button>
      </div>
    </div>
  )
}

// ─── Purchase History ───
function PurchaseHistory({ history }: { history: PurchaseRecord[] }) {
  const [open, setOpen] = useState(false)

  if (history.length === 0) return null

  return (
    <div className="rounded-xl border border-border/50 bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Historico de Resgates</h3>
            <p className="text-sm text-muted-foreground">{history.length} resgates realizados</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border/50 p-5 pt-0">
          <div className="mt-4 space-y-2">
            {history.map((p) => {
              const s = statusLabels[p.status]
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      {p.price}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Gestor: Team Redemptions ───
function GestorStorePanel() {
  const teamPurchases = getTeamPurchases()

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Resgates da Equipe</h3>
          <p className="text-sm text-muted-foreground">Ultimos resgates dos seus colaboradores</p>
        </div>
      </div>
      <div className="space-y-2">
        {teamPurchases.map((tp, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{tp.name}</p>
              <p className="text-xs text-muted-foreground">{tp.item}</p>
            </div>
            <div className="text-right">
              <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Coins className="h-3.5 w-3.5 text-primary" />
                {tp.price}
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(tp.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CEO: Store Analytics ───
function CeoStorePanel() {
  const stats = getStoreDashboardStats()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Gasto", value: `${stats.totalSpent.toLocaleString()} LC`, icon: Coins },
          { label: "Transacoes", value: stats.totalTransactions.toString(), icon: Package },
          { label: "Media por Usuario", value: `${stats.avgPerUser} LC`, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-5">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Top Items */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Itens Mais Resgatados</h3>
          </div>
          <div className="space-y-3">
            {stats.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{item.count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly spend trend */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Tendencia Mensal</h3>
          </div>
          <div className="flex h-40 items-end gap-2">
            {stats.monthlySpend.map((m) => {
              const maxVal = Math.max(...stats.monthlySpend.map((x) => x.value))
              const height = (m.value / maxVal) * 100
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {m.value >= 1000 ? `${(m.value / 1000).toFixed(1)}k` : m.value}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Store Page ───
export default function LojaPage() {
  const router = useRouter()
  const [user, setUser] = useState<MockUser | null>(null)
  const [coins, setCoins] = useState(0)
  const [category, setCategory] = useState<StoreCategory>("all")
  const [search, setSearch] = useState("")
  const [confirmItem, setConfirmItem] = useState<RewardItem | null>(null)
  const [successItem, setSuccessItem] = useState<string | null>(null)
  const [history, setHistory] = useState<PurchaseRecord[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("levelcorp_user")
    if (!stored) {
      router.push("/login")
      return
    }
    try {
      const u = JSON.parse(stored) as MockUser
      setUser(u)
      setCoins(u.coins)
      setHistory(getMockPurchaseHistory(u.id))
    } catch {
      router.push("/login")
    }
  }, [router])

  const filteredItems = useMemo(() => {
    let items = getItemsByCategory(category)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)
      )
    }
    return items
  }, [category, search])

  function handleRedeem() {
    if (!confirmItem || !user) return
    setCoins((prev) => prev - confirmItem.price)
    const newRecord: PurchaseRecord = {
      id: `p-${Date.now()}`,
      itemId: confirmItem.id,
      itemName: confirmItem.name,
      price: confirmItem.price,
      date: new Date().toISOString().split("T")[0],
      status: "resgatado",
    }
    setHistory((prev) => [newRecord, ...prev])
    setSuccessItem(confirmItem.name)
    setConfirmItem(null)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const categories: StoreCategory[] = ["all", "experiencias", "educacao", "lifestyle", "exclusivos"]

  return (
    <div className="min-h-screen bg-background">
      {/* Confirmation / Success overlays */}
      {confirmItem && (
        <ConfirmDialog
          item={confirmItem}
          userCoins={coins}
          onConfirm={handleRedeem}
          onCancel={() => setConfirmItem(null)}
        />
      )}
      {successItem && (
        <SuccessOverlay itemName={successItem} onClose={() => setSuccessItem(null)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </Link>
            <Image
              src="/images/logo-levelcorp.jpeg"
              alt="LevelCorp"
              width={28}
              height={28}
              className="h-7 w-7 rounded"
            />
            <span className="text-sm font-bold text-foreground">LevelCorp</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-bold text-primary">
              <Coins className="h-4 w-4" />
              {coins.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
              <Star className="h-4 w-4 text-primary" />
              Lv. {user.level}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Loja de Recompensas</h1>
          <p className="mt-1 text-muted-foreground">
            Resgate seus LevelCoins por beneficios exclusivos
          </p>
        </div>

        {/* CEO analytics panel */}
        {user.role === "ceo" && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Crown className="h-5 w-5 text-primary" />
              Painel da Loja
            </h2>
            <CeoStorePanel />
          </div>
        )}

        {/* Gestor team panel */}
        {user.role === "gestor" && (
          <div className="mb-8">
            <GestorStorePanel />
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const count =
                cat === "all" ? storeItems.length : storeItems.filter((it) => it.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {categoryIconMap[cat]}
                  {categoryLabels[cat]}
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      category === cat
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar recompensas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 font-medium text-muted-foreground">Nenhum item encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Tente ajustar os filtros ou a busca
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <RewardCard
                key={item.id}
                item={item}
                userCoins={coins}
                userLevel={user.level}
                onRedeem={(it) => setConfirmItem(it)}
              />
            ))}
          </div>
        )}

        {/* Purchase History */}
        <div className="mt-8">
          <PurchaseHistory history={history} />
        </div>
      </main>
    </div>
  )
}
