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
        "https://marvel-movie-bot.vercel.app",  # Replace with your actual Vercel domain
        "https://*.ngrok.io",                  # Allow all ngrok URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    actor_name: Optional[str] = "jarvis"

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]

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
        
        # Create messages for LLM
        messages = [
            SystemMessage(f"Act like {request.actor_name}. You are given a question and you need to answer it based on the context provided. If you don't know the answer, just say that you don't know. Do not make up an answer. Use the following context to answer the question: {docs_text}"),
            HumanMessage(request.message)
        ]
        
        # Get response from LLM
        result = llm.invoke(messages)
        
        return ChatResponse(
            response=result.content,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
