import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
key = os.getenv("GROQ_API_KEY")
print("Key starts with:", key[:4] if key else "None")

client = OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1")

try:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say Hello"}]
    )
    print("SUCCESS:", response.choices[0].message.content)
except Exception as e:
    print("FAILED:", e)
