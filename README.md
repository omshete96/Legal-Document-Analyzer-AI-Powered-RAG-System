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

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (Free)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/legal-document-analyzer.git
cd legal-document-analyzer
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in `backend/` and add your key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Usage

**Option 1: Quick Start (Windows)**
Run the included PowerShell script:
```powershell
.\start.ps1
```

**Option 2: Manual Start**
Terminal 1 (Backend):
```bash
cd backend
python main.py
```
Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Demo
*(Add screenshots of your dashboard here)*

## 📄 License
MIT
