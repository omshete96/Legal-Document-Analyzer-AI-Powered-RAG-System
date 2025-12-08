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
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
embedder = Embedder()
vector_store = VectorStore()

class QueryRequest(BaseModel):
    question: str

class AnalysisRequest(BaseModel):
    document_text: Optional[str] = None

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        text = extract_text_from_pdf(file_location)
        chunks = chunk_text(text)
        embeddings = embedder.embed_documents(chunks)
        
        # Store in Vector DB
        vector_store.add_documents(chunks, embeddings, [{"source": file.filename} for _ in chunks])
        
        # Cleanup
        os.remove(file_location)
        
        return {"message": "PDF processed and embedded successfully", "filename": file.filename, "total_chunks": len(chunks), "full_text": text}
    except Exception as e:
        print(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        query_embedding = embedder.embed_query(request.question)
        results = vector_store.query(query_embedding, n_results=5)
        
        context = "\n".join(results['documents'][0])
        
        prompt = f"""
        Answer the question based on the following context from a legal document.
        
        Context:
        {context}
        
        Question:
        {request.question}
        """
        
        answer = query_llm(prompt)
        return {"answer": answer, "context": results['documents'][0]}
    except Exception as e:
        print(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summary")
async def get_summary(request: AnalysisRequest):
    if not request.document_text:
         raise HTTPException(status_code=400, detail="Document text is required for summary (or implement ID based retrieval)")
    try:
        summary = summarize_document(request.document_text)
        return {"summary": summary}
    except Exception as e:
        print(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clauses")
async def get_clauses(request: AnalysisRequest):
    if not request.document_text:
         raise HTTPException(status_code=400, detail="Document text is required")
    try:
        clauses = extract_clauses(request.document_text)
        return {"clauses": clauses}
    except Exception as e:
        print(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risks")
async def get_risks(request: AnalysisRequest):
    if not request.document_text:
         raise HTTPException(status_code=400, detail="Document text is required")
    try:
        risks = analyze_risks(request.document_text)
        return {"risks": risks}
    except Exception as e:
        print(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
