import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Get company statistics
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID é obrigatório" },
        { status: 400 }
      )
    }

    // Get user count
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)

    // Get active users
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true)

    // Get department count
    const { count: departmentCount } = await supabase
      .from("departments")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)

    // Get pending invitations
    const { count: pendingInvitations } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "pending")

    // Get users by role
    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("company_id", companyId)

    const roleCount = {
      ceo: 0,
      gestor: 0,
      colaborador: 0,
    }

    roleData?.forEach((user) => {
      if (user.role in roleCount) {
        roleCount[user.role as keyof typeof roleCount]++
      }
    })

    // Get recent activity (users joined in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentJoins } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("created_at", sevenDaysAgo.toISOString())

    return NextResponse.json({
      stats: {
        totalUsers: userCount || 0,
        activeUsers: activeUsers || 0,
        departments: departmentCount || 0,
        pendingInvitations: pendingInvitations || 0,
        roleBreakdown: roleCount,
        recentJoins: recentJoins || 0,
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
