from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from dotenv import load_dotenv
import os
import time

from pinecone import Pinecone, ServerlessSpec

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = os.getenv("PINECONE_INDEX_NAME")

index = pc.Index(index_name)

embeddings = OllamaEmbeddings(
    model="mxbai-embed-large:335m"
)

vector_store = PineconeVectorStore(
    index=index,
    embedding=embeddings
)

retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 5, "score_threshold": 0.6}
)

llm = ChatOllama(
    model="llama3.1:8b",
    temperature=0.5
)

# prompt = input("Enter your question: ")
prompt = "In which movie did Tony stark say 'I love you 3000'?"

docs = retriever.invoke(prompt)

# for res in docs:
#     print(f"* {res.page_content} [{res.metadata['movie_name']}]")

docs_text = "".join(d.page_content for d in docs)

actor_name = "jarvis"

messages = [
    SystemMessage("Act like {actor_name}. You are given a question and you need to answer it based on the context provided. If you don't know the answer, just say that you don't know. Do not make up an answer. Use the following context to answer the question: " + docs_text),
    #HumanMessage("Who shot down War Machine in captain america: civil war?")
    HumanMessage(prompt)
]

result = llm.invoke(messages)

print(result.content)