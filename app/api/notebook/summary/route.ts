import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const summaryPrompts: Record<string, string> = {
  executive: `Crie um resumo executivo conciso do conteúdo fornecido. 
    Inclua: principais pontos, conclusões e recomendações.
    Formato: 2-3 parágrafos bem estruturados.`,
  bullets: `Crie um resumo em formato de bullet points do conteúdo fornecido.
    - Organize por tópicos principais
    - Use sub-bullets para detalhes importantes
    - Máximo de 15 bullets principais`,
  faq: `Crie um FAQ (Perguntas Frequentes) baseado no conteúdo fornecido.
    - Gere 5-8 perguntas que alguém faria sobre este conteúdo
    - Forneça respostas concisas mas completas
    - Formato: Q: [pergunta] A: [resposta]`,
  timeline: `Crie uma linha do tempo dos eventos ou conceitos apresentados no conteúdo.
    - Organize cronologicamente ou logicamente
    - Destaque marcos importantes
    - Use formato: [Data/Fase] - [Evento/Conceito]`,
  keyTerms: `Extraia e explique os termos-chave do conteúdo.
    - Liste 8-12 termos importantes
    - Forneça definições concisas
    - Formato: **Termo**: Definição`,
}

export async function POST(request: NextRequest) {
  try {
    const { notebookId, type } = await request.json()

    if (!notebookId || !type) {
      return NextResponse.json({ error: "notebookId e type necessários" }, { status: 400 })
    }

    if (!summaryPrompts[type]) {
      return NextResponse.json({ error: "Tipo de resumo inválido" }, { status: 400 })
    }

    // Fetch sources
    const supabase = await createClient()
    const { data: sources } = await supabase
      .from("sources")
      .select("name, content")
      .eq("notebook_id", notebookId)

    if (!sources || sources.length === 0) {
      return NextResponse.json({ error: "Nenhuma fonte encontrada" }, { status: 400 })
    }

    const content = sources.map(s => 
      `[${s.name}]\n${s.content?.slice(0, 20000) || ""}`
    ).join("\n\n---\n\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `Você é um assistente especializado em criar resumos de documentos. 
        Sempre responda em português brasileiro.
        ${summaryPrompts[type]}`,
      prompt: `Analise o seguinte conteúdo e crie o resumo solicitado:\n\n${content}`,
    })

    // Save summary
    const { data: summary, error } = await supabase
      .from("notebook_summaries")
      .insert({
        notebook_id: notebookId,
        type,
        content: text,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving summary:", error)
      return NextResponse.json({ error: "Erro ao salvar resumo" }, { status: 500 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summary error:", error)
    return NextResponse.json({ error: "Erro ao gerar resumo" }, { status: 500 })
  }
}
