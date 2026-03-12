import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { notebookId, title } = await request.json()

    if (!notebookId) {
      return NextResponse.json({ error: "notebookId necessário" }, { status: 400 })
    }

    // Fetch sources
    const supabase = await createClient()
    const { data: sources } = await supabase
      .from("sources")
      .select("name, content")
      .eq("notebook_id", notebookId)

    const { data: notebook } = await supabase
      .from("notebooks")
      .select("title")
      .eq("id", notebookId)
      .single()

    if (!sources || sources.length === 0) {
      return NextResponse.json({ error: "Nenhuma fonte encontrada" }, { status: 400 })
    }

    const content = sources.map(s => 
      `[${s.name}]\n${s.content?.slice(0, 15000) || ""}`
    ).join("\n\n---\n\n")

    // Generate podcast script
    const { text: script } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `Você é um roteirista de podcast. Crie um script de podcast estilo conversacional entre dois apresentadores (Ana e Bruno) discutindo o conteúdo fornecido.

FORMATO DO SCRIPT:
- Use "ANA:" e "BRUNO:" para indicar quem está falando
- A conversa deve ser natural e engajante
- Inclua introdução, discussão principal e conclusão
- Duração alvo: 5-8 minutos de conversa (aproximadamente 800-1200 palavras)
- Os hosts devem ter personalidades distintas:
  * Ana: mais analítica, faz perguntas profundas
  * Bruno: mais prático, dá exemplos do dia-a-dia
- Inclua transições naturais entre tópicos
- Termine com um resumo dos pontos principais`,
      prompt: `Crie um script de podcast sobre o seguinte conteúdo do notebook "${notebook?.title || 'Sem título'}":\n\n${content}`,
    })

    // Save podcast
    const { data: podcast, error } = await supabase
      .from("notebook_podcasts")
      .insert({
        notebook_id: notebookId,
        title: title || `Podcast: ${notebook?.title || 'Sem título'}`,
        script,
        status: "script_ready",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving podcast:", error)
      return NextResponse.json({ error: "Erro ao salvar podcast" }, { status: 500 })
    }

    return NextResponse.json({ podcast })
  } catch (error) {
    console.error("Podcast error:", error)
    return NextResponse.json({ error: "Erro ao gerar podcast" }, { status: 500 })
  }
}

// GET - List podcasts for a notebook
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const notebookId = searchParams.get("notebookId")

    if (!notebookId) {
      return NextResponse.json({ error: "notebookId necessário" }, { status: 400 })
    }

    const { data: podcasts, error } = await supabase
      .from("notebook_podcasts")
      .select("*")
      .eq("notebook_id", notebookId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar podcasts" }, { status: 500 })
    }

    return NextResponse.json({ podcasts })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
