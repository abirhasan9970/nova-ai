import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def get_ai_response_stream(user_message, chat_history):
    try:
        messages = [
            {"role": "system", "content": "You are NOVA AI, a smart, friendly, and helpful AI assistant."}
        ]
        
        for msg in chat_history:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": user_message})

        # Updated to Groq's recommended replacement model
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            stream=True
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        yield "Sorry, there is an issue connecting to the Groq AI server."
