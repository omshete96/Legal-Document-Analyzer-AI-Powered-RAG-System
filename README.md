# ⚖️ Legal Document Analyzer

A powerful full-stack AI application that uses **Retrieval-Augmented Generation (RAG)** to analyze legal documents. Upload contracts to extract key clauses, identify risks, summarize content, and ask questions in real-time.

## 🚀 Features

- **📄 RAG-Powered Q&A**: Chat with your PDF documents using context-aware AI.
- **🔍 Clause Extraction**: Automatically identifies key terms like Termination, Liability, and Confidentiality.
- **⚠️ Risk Detection**: Highlights high-risk clauses (e.g., unlimited liability, automatic renewal).
- **📝 Instant Summaries**: Generates concise summaries of complex legal texts.
- **⚡ Fast Inference**: Powered by **Groq API** (Llama 3) for near-instant results.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Python, FastAPI, Uvicorn
- **AI & Data**: 
  - **LLM**: Groq API (Llama-3.3-70b)
  - **Vector DB**: ChromaDB
  - **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`)
  - **PDF Processing**: PyPDF2
