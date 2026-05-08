from .groq_client import query_llm

def analyze_risks(text: str) -> str:
    prompt = f"""
    Analyze the following legal document text for high-risk clauses.
    Look for:
    - Unfair termination rights
    - Unlimited liability
    - One-sided indemnification
    - Ambiguous payment terms
    - Automatic renewal without notice

    Highlight these risks and explain why they are risky.
    Return the result as a list of risks with severity levels (High, Medium, Low).

    Document Text:
    {text[:15000]}
    """
    return query_llm(prompt)
