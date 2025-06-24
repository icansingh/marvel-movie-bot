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
results = retriever.invoke("What did Tony Stark say to morganin Avengers endgame?")

for res in results:
    print(f"* {res.page_content} [{res.metadata['movie_name']}]")

llm = ChatOllama(
    model="llama3.1:8b",
    temperature=0.5
)

# prompt = input("Enter your question: ")
prompt = "What did Tony Stark say to his daughter in his last message in Avengers endgame?"

docs = retriever.invoke(prompt)

docs_text = "".join(d.page_content for d in docs)



messages = [
    SystemMessage("Act like a nerdy movie expert. You are given a question and you need to answer it based on the context provided. If you don't know the answer, just say that you don't know. Do not make up an answer. Use the following context to answer the question: " + docs_text),
    #HumanMessage("Who shot down War Machine in captain america: civil war?")
    HumanMessage("What did Tony Stark say to his daughter in his last message in Avengers endgame?")
]

result = llm.invoke(messages)

print(result.content)