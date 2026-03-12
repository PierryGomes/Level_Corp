import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all notebooks or get specific notebook
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const notebookId = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (notebookId) {
      // Get specific notebook with sources
      const { data: notebook, error } = await supabase
        .from("notebooks")
        .select(`
          *,
          sources (*),
          notebook_summaries (*),
          notebook_podcasts (*)
        `)
        .eq("id", notebookId)
        .single()

      if (error) {
        return NextResponse.json({ error: "Notebook não encontrado" }, { status: 404 })
      }

      return NextResponse.json({ notebook })
    }

    if (userId) {
      // List all notebooks for user
      const { data: notebooks, error } = await supabase
        .from("notebooks")
        .select(`
          *,
          sources (id, name, type, word_count)
        `)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: "Erro ao buscar notebooks" }, { status: 500 })
      }

      return NextResponse.json({ notebooks })
    }

    return NextResponse.json({ error: "userId ou id necessário" }, { status: 400 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Create new notebook
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { userId, title, description } = body

    if (!userId) {
      return NextResponse.json({ error: "userId necessário" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("notebooks")
      .insert({
        user_id: userId,
        title: title || "Novo Notebook",
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Erro ao criar notebook" }, { status: 500 })
    }

    return NextResponse.json({ notebook: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PATCH - Update notebook
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, title, description } = body

    if (!id) {
      return NextResponse.json({ error: "id necessário" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("notebooks")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erro ao atualizar notebook" }, { status: 500 })
    }

    return NextResponse.json({ notebook: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE - Delete notebook
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id necessário" }, { status: 400 })
    }

    const { error } = await supabase
      .from("notebooks")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Erro ao deletar notebook" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
