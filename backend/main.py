from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import database
import ai_service

app = FastAPI(title="NOVA AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.init_db()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "NOVA AI Backend is Running!"}

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        
    database.save_message(session_id, "user", request.message)
    history = database.get_chat_history(session_id, limit=8)
    
    # Streaming Response তৈরি করার অংশ
    def generate():
        full_response = ""
        # এখানে ai_service থেকে টুকরো টুকরো ডেটা নেওয়া হচ্ছে
        for chunk in ai_service.get_ai_response_stream(request.message, history):
            full_response += chunk
            yield chunk
            
        # পুরো উত্তর শেষ হলে ডেটাবেসে সেভ হবে
        database.save_message(session_id, "assistant", full_response)

    return StreamingResponse(generate(), media_type="text/plain", headers={"X-Session-ID": session_id})
