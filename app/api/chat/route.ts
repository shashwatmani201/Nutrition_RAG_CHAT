export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 1) helper: create embedding for a query
async function embedQuery(openai: OpenAI, query: string) {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small", // matches example screenshots
    input: query,
  });
  return resp.data[0].embedding;
}

export async function POST(req: NextRequest) {

  // OpenAI moved inside POST
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // ✅ Supabase moved inside POST (minimal required fix)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  try {
    const body = await req.json();
    const message = (body?.message ?? "").toString().trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Empty query" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // 1) Embed the query
    const queryEmb = await embedQuery(openai, message);

    // 2) Retrieve from Supabase via RPC
    const { data: chunks, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmb,
      match_count: 8,
      filter: { source: "human-nutrition-text.pdf" },
    });

    if (error) throw error;

    const context = (chunks ?? []).map((c: any, i: number) =>
      `[${i + 1}] (Page ${c.metadata?.page ?? "?"})\n${c.content}`
    ).join("\n\n");

    if (!context) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find this in the provided document.",
          sources: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a strict RAG assistant. Answer ONLY using the CONTEXT. " +
            "Cite sources like [1], [2] and include page numbers.",
        },
        {
          role: "user",
          content: `QUESTION: ${message}\n\nCONTEXT:\n${context}`,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ?? "No answer generated.";

    const sources = (chunks ?? []).map((c: any, i: number) => ({
      id: c.id,
      index: i + 1,
      page: c.metadata?.page ?? null,
      preview: (c.content ?? "").slice(0, 200),
      similarity: c.similarity ?? null,
    }));

    return new Response(
      JSON.stringify({ answer, sources }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Server error: " + (err.message ?? String(err)) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
