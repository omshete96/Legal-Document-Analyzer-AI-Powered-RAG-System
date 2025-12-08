import os
from dotenv import load_dotenv
from groq import Groq

# Load env vars explicitly from the current directory
load_dotenv()

def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    print(f"API Key found: {'Yes' if api_key else 'No'}")
    if api_key:
        print(f"API Key length: {len(api_key)}")
        print(f"API Key start: {api_key[:4]}...")
    
    try:
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Say hello",
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        print("Success! Response:", chat_completion.choices[0].message.content)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    test_groq()
