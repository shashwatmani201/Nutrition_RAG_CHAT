// "use client";

// import { useState } from "react";

// export default function Home() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<
//     { role: "user" | "assistant"; content: string }[]
//   >([]);
//   const [sources, setSources] = useState<any[]>([]);
//   const [busy, setBusy] = useState(false);

//   async function send() {
//     if (!input.trim()) return;

//     // Add user message
//     setMessages((m) => [...m, { role: "user", content: input }]);
//     setBusy(true);

//     // API call — uses 'message' (matches route.ts)
//     const res = await fetch("/api/chat", {
//       method: "POST",
//       body: JSON.stringify({ message: input }),
//     });

//     const data = await res.json();

//     // Add assistant message
//     setMessages((m) => [...m, { role: "assistant", content: data.answer }]);

//     // Save retrieved sources
//     setSources(data.sources || []);

//     setBusy(false);
//     setInput("");
//   }

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">🍃 Nutritional RAG Chat</h1>

//       {/* Chat messages */}
//       <div className="space-y-3 mb-4">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`p-3 rounded-lg ${
//               m.role === "user" ? "bg-blue-100" : "bg-green-100"
//             }`}
//           >
//             <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
//           </div>
//         ))}
//       </div>

//       {/* Input + button */}
//       <div className="flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           className="border p-2 rounded w-full"
//           placeholder="Ask something…"
//         />
//         <button
//           onClick={send}
//           disabled={busy}
//           className="bg-black text-white px-4 rounded"
//         >
//           {busy ? "..." : "Send"}
//         </button>
//       </div>

//       {/* Sources */}
//       {sources.length > 0 && (
//         <div className="mt-6">
//           <h2 className="font-semibold mb-1">Sources:</h2>
//           <ul className="list-disc pl-6 text-sm space-y-1">
//             {sources.map((s: any, i: number) => (
//               <li key={i}>
//                 <b>[{s.index}]</b> Page {s.page ?? "?"} —{" "}
//                 <span>{s.preview}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Plus, Sun, Moon, Send } from "lucide-react";

export default function ChatUIWithIntro() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [sources, setSources] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // intro visibility (true initially)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // theme
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // persist theme change to document & localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    if (!input.trim()) return;

    // Hide intro as soon as user starts chat
    if (showIntro) setShowIntro(false);

    // add user message locally
    setMessages((m) => [...m, { role: "user", content: input }]);
    setBusy(true);

    // call backend
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
      setSources(data.sources || []);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oops — something went wrong." },
      ]);
    } finally {
      setBusy(false);
      setInput("");
    }
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-green-50 to-white dark:from-black dark:to-gray-900">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-[#071021] border-r border-gray-200 dark:border-gray-800 p-4">
        <button className="mb-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2">
          <Plus size={16} /> New Chat
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recent Chats</div>
        <div className="space-y-2 overflow-y-auto flex-1">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-[#071826] cursor-pointer">Nutrition tips</div>
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-[#071826] cursor-pointer">Diet plan</div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Presented by Shashwat</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-[#071021] dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2">
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-semibold">🍃 Nutrition RAG AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

          </div>
        </header>

        {/* Intro overlay (center) */}
        {showIntro && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/95 dark:bg-black/80 animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              {/* Logo: change src if using svg */}
              <img
                src="/shashwat-logo.png"
                alt="Shashwat logo"
                className="w-28 h-28 object-contain logo-neon logo-tilt logo-glow-pulse"
              />

              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                <span className="text-green-600"> RAG </span> based Nutrition Chatbot
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Presented by <span className="text-green-600"> Shashwat </span>
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setShowIntro(false)}
                  className="px-4 py-2 rounded-full bg-green-600 text-white"
                >
                  Start Chatting
                </button>

                <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
                  <span className="loading-dots text-green-600">
                    <span></span><span></span><span></span>
                  </span>
                  <span>Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat container */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
            {messages.length === 0 && !showIntro && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Say hello 👋 — ask about nutrition, vitamins, food sources, or recipes.
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${m.role === "user" ? "bg-black text-white rounded-br-none" : "bg-white dark:bg-[#0b1722] border border-gray-200 dark:border-gray-800 rounded-bl-none"}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#0b1722] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-bl-none w-fit">
                  <div className="loading-dots text-gray-600">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-white dark:bg-[#071021] dark:border-gray-800 flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Nutrition RAG…"
              className="flex-1 px-4 py-3 rounded-full bg-gray-100 dark:bg-[#0b1722] border border-gray-200 dark:border-gray-800 focus:outline-none"
            />

            <button
              onClick={send}
              disabled={busy}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full disabled:opacity-60"
            >
              {busy ? "..." : <Send size={16} />}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

