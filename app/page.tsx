"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [sources, setSources] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;

    // Add user message
    setMessages((m) => [...m, { role: "user", content: input }]);
    setBusy(true);

    // API call — uses 'message' (matches route.ts)
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    // Add assistant message
    setMessages((m) => [...m, { role: "assistant", content: data.answer }]);

    // Save retrieved sources
    setSources(data.sources || []);

    setBusy(false);
    setInput("");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🍃 Nutritional RAG Chat</h1>

      {/* Chat messages */}
      <div className="space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              m.role === "user" ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
          </div>
        ))}
      </div>

      {/* Input + button */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Ask something…"
        />
        <button
          onClick={send}
          disabled={busy}
          className="bg-black text-white px-4 rounded"
        >
          {busy ? "..." : "Send"}
        </button>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-1">Sources:</h2>
          <ul className="list-disc pl-6 text-sm space-y-1">
            {sources.map((s: any, i: number) => (
              <li key={i}>
                <b>[{s.index}]</b> Page {s.page ?? "?"} —{" "}
                <span>{s.preview}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
