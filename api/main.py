from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import sys

# Add the parent directory to the path to import your existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import llm, retriever
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

app = FastAPI(title="Marvel Movie Bot API", version="1.0.0")

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://marvel-movie-bot.vercel.app",  # Vercel domain
        "https://*.ngrok.io",
        "https://*.ngrok-free.app"                  # Allow all ngrok URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_system_prompt():
    with open(os.path.join(os.path.dirname(__file__), "system_prompt.txt"), "r") as f:
        return f.read()
SYSTEM_PROMPT_TEMPLATE = load_system_prompt()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    actor_name: Optional[str] = "jarvis"
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]
    conversation_history: List[ChatMessage]

@app.get("/")
async def root():
    return {"message": "Marvel Movie Bot API is running!"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Get relevant documents
        docs = retriever.invoke(request.message)
        
        # Prepare context
        docs_text = "".join(d.page_content for d in docs)
        
        # Prepare sources for response
        sources = [
            {
                "content": doc.page_content[:200] + "...",
                "movie": doc.metadata.get('movie_name', 'Unknown'),
                "score": doc.metadata.get('score', 0)
            }
            for doc in docs
        ]
        
        # Build conversation history for LLM
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            actor_name=request.actor_name,
            context=docs_text  # or "" if not MCU-related
        )
        messages = [
            SystemMessage(system_prompt),
        ]
        
        # Add conversation history
        for msg in request.conversation_history:
            if msg.role == "user":
                messages.append(HumanMessage(msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(msg.content))
        
        # Add current user message
        messages.append(HumanMessage(request.message))
        
        # Get response from LLM
        result = llm.invoke(messages)
        
        # Build updated conversation history
        updated_history = request.conversation_history.copy()
        updated_history.append(ChatMessage(role="user", content=request.message))
        updated_history.append(ChatMessage(role="assistant", content=result.content))
        
        return ChatResponse(
            response=result.content,
            sources=sources,
            conversation_history=updated_history
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
