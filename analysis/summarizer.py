from .groq_client import query_llm

def summarize_document(text: str) -> str:
    prompt = f"""
    Provide a concise summary of the following legal document.
    Include the main purpose, key parties involved, and the most critical terms.

    Document Text:
    {text[:15000]}
    """
    return query_llm(prompt)
