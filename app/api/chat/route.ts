// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3";

export async function POST(req: NextRequest) {
  let message: string;

  try {
    const body = await req.json();
    message = (body?.message ?? "").trim();
  } catch {
    return NextResponse.json(
      { ok: false, reply: "⚠️ Invalid request body." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { ok: false, reply: "⚠️ Message cannot be empty." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30 s timeout

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: message,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Ollama HTTP error:", response.status, errText);
      return NextResponse.json(
        { ok: false, reply: `⚠️ LLaMA responded with status ${response.status}. Make sure Ollama is running: 'ollama serve'` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data?.response) {
      console.error("Ollama empty response:", data);
      return NextResponse.json(
        { ok: false, reply: "⚠️ LLaMA returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, reply: data.response });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error("Ollama request timed out");
      return NextResponse.json(
        { ok: false, reply: "⚠️ LLaMA took too long to respond (30 s timeout). Try a shorter message." },
        { status: 504 }
      );
    }

    const isConnectionRefused =
      error?.cause?.code === "ECONNREFUSED" ||
      error?.message?.includes("ECONNREFUSED") ||
      error?.message?.includes("fetch failed");

    if (isConnectionRefused) {
      console.error("Ollama not running:", error.message);
      return NextResponse.json(
        {
          ok: false,
          reply:
            "⚠️ LLaMA is not running.\n\nTo start it:\n1. Install Ollama: https://ollama.com/download\n2. Run: ollama pull llama3\n3. Run: ollama serve",
        },
        { status: 503 }
      );
    }

    console.error("Ollama unexpected error:", error);
    return NextResponse.json(
      { ok: false, reply: "⚠️ Unexpected error talking to LLaMA backend." },
      { status: 500 }
    );
  }
}