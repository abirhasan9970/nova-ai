import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("XAI_API_KEY")

url = "https://api.x.ai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "model": "grok-beta",
    "messages": [{"role": "user", "content": "Hello"}]
}

try:
    print("Sending request to xAI...")
    response = requests.post(url, headers=headers, json=data)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Failed:", e)
