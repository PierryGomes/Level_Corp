import { streamText } from "ai"
import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { message, notebookId, sources: clientSources } = await request.json()

    if (!notebookId || !message) {
      return new Response("notebookId e message são necessários", { status: 400 })
    }

    // Use sources from client or fetch from DB
    let sourcesContext = ""
    if (clientSources && clientSources.length > 0) {
      sourcesContext = clientSources.map((source: { name: string; content: string }, index: number) => 
        `[Fonte ${index + 1}: ${source.name}]\n${source.content?.slice(0, 15000) || "Sem conteúdo"}\n`
      ).join("\n---\n")
    } else {
      const supabase = await createClient()
      const { data: sources } = await supabase
        .from("sources")
        .select("id, name, content")
        .eq("notebook_id", notebookId)

      sourcesContext = sources?.map((source, index) => 
        `[Fonte ${index + 1}: ${source.name}]\n${source.content?.slice(0, 15000) || "Sem conteúdo"}\n`
      ).join("\n---\n") || "Nenhuma fonte disponível."
    }

    const systemPrompt = `Você é um assistente de IA especializado em analisar e discutir documentos. Você tem acesso às seguintes fontes de informação:

${sourcesContext}

REGRAS IMPORTANTES:
1. Sempre baseie suas respostas nas fontes fornecidas
2. Quando citar informações, indique a fonte usando [Fonte X]
3. Se a pergunta não puder ser respondida com as fontes disponíveis, diga claramente
4. Seja conciso mas completo
5. Use formatação markdown para melhor legibilidade
6. Responda sempre em português brasileiro`

    // Save user message to database
    const supabase = await createClient()
    await supabase.from("notebook_chats").insert({
      notebook_id: notebookId,
      role: "user",
      content: message,
    })

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Erro no chat", { status: 500 })
  }
}
