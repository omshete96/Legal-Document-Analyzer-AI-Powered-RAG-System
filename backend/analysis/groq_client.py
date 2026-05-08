import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)


def query_llm(prompt: str, model: str = "llama-3.3-70b-versatile") -> str:
    client = get_groq_client()
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert legal document analyst. "
                    "You answer questions strictly based on the document context provided to you. "
                    "You never fabricate information. "
                    "If something is not in the context, you say so clearly."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        model=model,
        temperature=0.1,   # low temperature = more factual, less hallucination
        max_tokens=1024,
    )
    return chat_completion.choices[0].message.content
