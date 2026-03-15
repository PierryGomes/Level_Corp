import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - List users of a company
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

    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        role,
        avatar_color,
        avatar_style,
        xp,
        level,
        is_active,
        last_login,
        created_at,
        department_id,
        departments (
          id,
          name
        )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Remove user from company
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const companyId = searchParams.get("companyId")

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "User ID e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    // Verify user belongs to company
    const { data: user } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .eq("company_id", companyId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Prevent deleting CEO
    if (user.role === "ceo") {
      return NextResponse.json(
        { error: "Não é possível remover o CEO da empresa" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .eq("company_id", companyId)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json(
        { error: "Erro ao remover usuário" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH - Update user role or department
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { userId, companyId, role, departmentId, isActive } = body

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "User ID e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (role !== undefined) updates.role = role
    if (departmentId !== undefined) updates.department_id = departmentId
    if (isActive !== undefined) updates.is_active = isActive
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .eq("company_id", companyId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json(
        { error: "Erro ao atualizar usuário" },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
