# 🍃 Nutrition RAG AI

> **A Retrieval-Augmented Generation (RAG) Chatbot for Nutritional Science.**
> *Presented by Shashwat*

Nutrition RAG AI is a full-stack intelligent question-answering system designed to let users "chat" with a comprehensive Human Nutrition textbook. Unlike standard chatbots that hallucinate, this system is grounded in specific source data (`human-nutrition-text.pdf`), providing accurate answers with citations and page references.

## 🚀 Why This Project is Better

* **Strictly Grounded (No Hallucinations):** The AI is engineered to answer *only* using the provided context. If the answer isn't in the book, it says so.
* **Smart Semantic Chunking:** Unlike basic RAG tutorials that chop text arbitrarily, this project uses a custom Python ingestion pipeline (`ingest.py`) that respects sentence boundaries and semantic overlap, ensuring concepts aren't cut in half.
* **Verifiable Accuracy:** Every answer comes with **citations** (e.g., `[1] (Page 24)`) and a preview of the source text, so users can trust the output.
* **Cost-Optimized Architecture:** Built on OpenAI's `gpt-4o-mini` and `text-embedding-3-small`, delivering high performance at a fraction of the cost of larger models.
* **Modern UI/UX:** Features a responsive Next.js frontend with Dark Mode, sidebar history, and a "streaming-like" user experience.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Font:** Geist Sans / Mono

### **Backend & AI**
* **API:** Next.js API Routes (Node.js runtime)
* **LLM:** OpenAI GPT-4o-mini
* **Embeddings:** OpenAI text-embedding-3-small (1536 dimensions)
* **Orchestration:** Manual RAG pipeline (Custom prompts & context injection)

### **Database & Infrastructure**
* **Vector Store:** Supabase (PostgreSQL + pgvector)
* **Ingestion Script:** Python (PyMuPDF, TikToken, Supabase Client)
* **Containerization:** Docker Support included

---

## ⚡ Features

- **Context-Aware Answers:** Retrieves the top 8 most relevant text chunks to answer queries.
- **Source Citations:** Displays exact page numbers and text snippets used to generate the answer.
- **Dark/Light Mode:** Fully responsive theme toggle.
- **Custom Ingestion Pipeline:** Python script that cleans, chunks, and embeds PDF data automatically.
- **Robust Error Handling:** graceful fallbacks for empty queries or API errors.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js 18+
* Python 3.10+
* Supabase Account
* OpenAI API Key

### 2. Clone the Repository
```bash
git clone [https://github.com/yourusername/nutrition-rag-ai.git](https://github.com/yourusername/nutrition-rag-ai.git)
cd nutrition-rag-ai




3. Environment Variables

Create a .env file in the root rag-chat directory:

Code snippet
OPENAI_API_KEY=sk-proj-your-key-here
SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here


4. Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor to enable vectors and create the match function:

SQL
-- Enable the pgvector extension
create extension if not exists vector;

-- Create the chunks table
create table chunks (
  id bigserial primary key,
  doc_id text,
  content text,
  embedding vector(1536),
  metadata jsonb
);

-- Create the similarity search function (RPC)
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT 8,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where metadata @> filter
  order by chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;



5. Ingest the Data

Install Python dependencies and run the ingestion script to populate your database.

Bash
# Inside the root directory
pip install pymupdf tiktoken supabase openai tqdm python-dotenv

# Run the script
python ingest.py
This will read human-nutrition-text.pdf, chunk it into sentences, generate embeddings, and upload them to Supabase.


6. Run the Application

Bash
cd rag-chat
npm install
npm run dev
Open http://localhost:3000 to start chatting!


📂 Project Structure
Bash
├── ingest.py               # Python script for PDF processing & embedding
├── rag-chat/
│   ├── app/
│   │   ├── api/chat/       # Backend API route for RAG logic
│   │   └── page.tsx        # Main Chat Interface (Client Component)
│   ├── components/         # UI Components
│   └── public/             # Static assets (images, fonts)
├── .env                    # Environment secrets
└── Dockerfile              # Docker configuration for production


🧠 How It Works (The RAG Pipeline)
Ingestion: The ingest.py script splits the PDF into small, overlapping chunks (approx. 20 sentences) to preserve context.

Embedding: Each chunk is converted into a vector (list of numbers) using OpenAI's text-embedding-3-small.

Storage: Vectors are stored in Supabase.

Retrieval: When you ask a question, your query is converted into a vector. The database finds the 8 "nearest" chunks mathematically.

Generation: These chunks are pasted into a strict system prompt ("Answer ONLY using the CONTEXT") and sent to GPT-4o-mini to generate the final answer.


🤝 Contributing
Contributions are welcome! Please fork the repo and submit a PR.

📜 License
This project is licensed under the MIT License.