import os, requests
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("XAI_API_KEY")
r = requests.get("https://api.x.ai/v1/api-key", headers={"Authorization": f"Bearer {key}"})
print("Status:", r.status_code)
print("Response:", r.text)
