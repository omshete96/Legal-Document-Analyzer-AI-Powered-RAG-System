from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from typing import List, Optional

from embeddings.chunker import extract_text_from_pdf, chunk_text
from embeddings.embedder import Embedder
from embeddings.vectorstore import VectorStore
from analysis.clause_extractor import extract_clauses
from analysis.risk_analyzer import analyze_risks
from analysis.summarizer import summarize_document
from analysis.groq_client import query_llm

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
embedder = Embedder()
vector_store = VectorStore()

# Track the currently active document (in-memory session)
current_document: dict = {"filename": None, "text": None}


class QueryRequest(BaseModel):
    question: str
    filename: Optional[str] = None   # which doc to search in


class AnalysisRequest(BaseModel):
    document_text: Optional[str] = None


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)

        text = extract_text_from_pdf(file_location)
        print(f"[UPLOAD] Extracted {len(text)} chars from '{file.filename}'")

        # Use smaller chunks (150 words) so retrieval is more precise
        chunks = chunk_text(text, chunk_size=150, overlap=20)
        print(f"[UPLOAD] Created {len(chunks)} chunks")

        if not chunks:
            os.remove(file_location)
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text from the PDF. "
                    "The file may be image-based or password-protected."
                ),
            )

        # Wipe any previous data for this filename and store fresh embeddings
        vector_store.clear_and_use(file.filename)
        embeddings = embedder.embed_documents(chunks)
        vector_store.add_documents(file.filename, chunks, embeddings)

        # Remember active document
        current_document["filename"] = file.filename
        current_document["text"] = text

        os.remove(file_location)

        return {
            "message": "PDF processed and embedded successfully",
            "filename": file.filename,
            "total_chunks": len(chunks),
            "full_text": text,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR /upload] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Ask (RAG Q&A)
# ---------------------------------------------------------------------------
@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        # Use filename from request, or fall back to the last uploaded doc
        filename = request.filename or current_document.get("filename")
        if not filename:
            raise HTTPException(
                status_code=400,
                detail="No document loaded. Please upload a PDF first.",
            )

        query_embedding = embedder.embed_query(request.question)
        results = vector_store.query(filename, query_embedding, n_results=5)

        retrieved_chunks = results["documents"][0]
        context = "\n\n---\n\n".join(retrieved_chunks)

        prompt = f"""You are a precise legal document analyst. Answer the user's question using ONLY the information found in the document context below.

Rules:
- Answer strictly from the provided context. Do NOT use any outside knowledge.
- If the answer is not in the context, say: "This information is not found in the document."
- Be concise and factual. Use bullet points where appropriate.
- Never invent names, dates, or legal terms not present in the context.

--- DOCUMENT CONTEXT ---
{context}
--- END OF CONTEXT ---

Question: {request.question}

Answer:"""

        answer = query_llm(prompt)
        return {"answer": answer, "context": retrieved_chunks}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR /ask] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Summary / Clauses / Risks
# ---------------------------------------------------------------------------
@app.post("/summary")
async def get_summary(request: AnalysisRequest):
    if not request.document_text:
        raise HTTPException(status_code=400, detail="Document text is required.")
    try:
        summary = summarize_document(request.document_text)
        return {"summary": summary}
    except Exception as e:
        print(f"[ERROR /summary] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clauses")
async def get_clauses(request: AnalysisRequest):
    if not request.document_text:
        raise HTTPException(status_code=400, detail="Document text is required.")
    try:
        clauses = extract_clauses(request.document_text)
        return {"clauses": clauses}
    except Exception as e:
        print(f"[ERROR /clauses] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/risks")
async def get_risks(request: AnalysisRequest):
    if not request.document_text:
        raise HTTPException(status_code=400, detail="Document text is required.")
    try:
        risks = analyze_risks(request.document_text)
        return {"risks": risks}
    except Exception as e:
        print(f"[ERROR /risks] {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
