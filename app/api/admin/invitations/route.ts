import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

// GET - List invitations for a company
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

    const { data: invitations, error } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role,
        status,
        invite_token,
        expires_at,
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
      console.error("Error fetching invitations:", error)
      return NextResponse.json(
        { error: "Erro ao buscar convites" },
        { status: 500 }
      )
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Get invitations error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new invitation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, role, departmentId, companyId, invitedBy } = body

    if (!email || !companyId) {
      return NextResponse.json(
        { error: "Email e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado na plataforma" },
        { status: 409 }
      )
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("company_id", companyId)
      .eq("status", "pending")
      .single()

    if (existingInvite) {
      return NextResponse.json(
        { error: "Já existe um convite pendente para este email" },
        { status: 409 }
      )
    }

    // Generate unique token
    const inviteToken = randomBytes(32).toString("hex")

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        role: role || "colaborador",
        department_id: departmentId || null,
        company_id: companyId,
        invited_by: invitedBy || null,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating invitation:", error)
      return NextResponse.json(
        { error: "Erro ao criar convite" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      invitation,
      inviteLink: `/invite/${inviteToken}`,
    })
  } catch (error) {
    console.error("Create invitation error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Cancel invitation
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get("invitationId")
    const companyId = searchParams.get("companyId")

    if (!invitationId || !companyId) {
      return NextResponse.json(
        { error: "Invitation ID e Company ID são obrigatórios" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("invitations")
      .update({ status: "cancelled" })
      .eq("id", invitationId)
      .eq("company_id", companyId)

    if (error) {
      console.error("Error cancelling invitation:", error)
      return NextResponse.json(
        { error: "Erro ao cancelar convite" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel invitation error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
