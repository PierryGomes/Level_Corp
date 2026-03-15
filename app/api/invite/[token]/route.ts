import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// GET - Get invitation details by token
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      )
    }

    const { data: invitation, error } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        department_id,
        company_id,
        departments (
          id,
          name
        ),
        companies (
          id,
          name,
          slug
        )
      `)
      .eq("invite_token", token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Este convite expirou", expired: true },
        { status: 410 }
      )
    }

    // Check if already used
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Este convite já foi utilizado", used: true },
        { status: 410 }
      )
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error("Get invitation error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Accept invitation and create user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params
    const body = await request.json()

    const { fullName, password, birthDate } = body

    if (!fullName || !password || !birthDate) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      )
    }

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        department_id,
        company_id,
        companies (
          id,
          name,
          slug
        )
      `)
      .eq("invite_token", token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      )
    }

    // Validate invitation
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 410 }
      )
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Este convite já foi utilizado" },
        { status: 410 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        full_name: fullName,
        email: invitation.email,
        password_hash: passwordHash,
        birth_date: birthDate,
        role: invitation.role,
        company_id: invitation.company_id,
        department_id: invitation.department_id,
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      )
    }

    // Update invitation status
    await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id)

    // Return user data
    const company = invitation.companies as { id: string; name: string; slug: string }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        companyId: company.id,
        companyName: company.name,
        companySlug: company.slug,
      },
    })
  } catch (error) {
    console.error("Accept invitation error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
