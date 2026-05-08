from .groq_client import query_llm

def extract_clauses(text: str) -> str:
    prompt = f"""
    Analyze the following legal document text and extract key clauses.
    Focus on: Termination, Liability, Confidentiality, Governing Law, Penalties, Dispute Resolution.
    
    Return the result in a structured JSON format with clause names as keys and the extracted text as values.
    If a clause is not found, indicate "Not Found".

    Document Text:
    {text[:15000]}  # Truncate to avoid token limits if necessary, though RAG is better for full doc.
    """
    # Note: For full document analysis without RAG, we might hit token limits. 
    # Ideally, we should use the RAG retrieved context or chunk processing.
    # For this implementation, we will assume we pass a significant portion or a summary.
    # However, to be robust, let's just use the provided text.
    
    return query_llm(prompt)
