import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - List departments of a company
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

    // Get departments with user count
    const { data: departments, error } = await supabase
      .from("departments")
      .select(`
        id,
        name,
        description,
        created_at,
        users (id)
      `)
      .eq("company_id", companyId)
      .order("name")

    if (error) {
      console.error("Error fetching departments:", error)
      return NextResponse.json(
        { error: "Erro ao buscar departamentos" },
        { status: 500 }
      )
    }

    // Add user count
    const departmentsWithCount = departments?.map((dept) => ({
      ...dept,
      userCount: dept.users?.length || 0,
      users: undefined,
    }))

    return NextResponse.json({ departments: departmentsWithCount })
  } catch (error) {
    console.error("Get departments error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new department
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { name, description, companyId } = body

    if (!name || !companyId) {
      return NextResponse.json(
        { error: "Nome e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    // Check if department with same name exists
    const { data: existing } = await supabase
      .from("departments")
      .select("id")
      .eq("company_id", companyId)
      .ilike("name", name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um departamento com este nome" },
        { status: 409 }
      )
    }

    const { data: department, error } = await supabase
      .from("departments")
      .insert({
        name,
        description: description || null,
        company_id: companyId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating department:", error)
      return NextResponse.json(
        { error: "Erro ao criar departamento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ department })
  } catch (error) {
    console.error("Create department error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Remove department
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")
    const companyId = searchParams.get("companyId")

    if (!departmentId || !companyId) {
      return NextResponse.json(
        { error: "Department ID e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    // Check if department has users
    const { data: users } = await supabase
      .from("users")
      .select("id")
      .eq("department_id", departmentId)
      .limit(1)

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: "Não é possível remover departamento com usuários" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", departmentId)
      .eq("company_id", companyId)

    if (error) {
      console.error("Error deleting department:", error)
      return NextResponse.json(
        { error: "Erro ao remover departamento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete department error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH - Update department
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { departmentId, companyId, name, description } = body

    if (!departmentId || !companyId) {
      return NextResponse.json(
        { error: "Department ID e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const { data, error } = await supabase
      .from("departments")
      .update(updates)
      .eq("id", departmentId)
      .eq("company_id", companyId)
      .select()
      .single()

    if (error) {
      console.error("Error updating department:", error)
      return NextResponse.json(
        { error: "Erro ao atualizar departamento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ department: data })
  } catch (error) {
    console.error("Update department error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
