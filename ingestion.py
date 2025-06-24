from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from dotenv import load_dotenv
import os
import time

from pinecone import Pinecone, ServerlessSpec

def initialize_index():
    load_dotenv()

    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    index_name = os.getenv("PINECONE_INDEX_NAME")

    existing_indexes = [index_info['name'] for index_info in pc.list_indexes()]

    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=1024, # Important to set the dimension to the same as the embedding model
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        while not pc.describe_index(index_name).status.ready:
            time.sleep(1)

    index = pc.Index(index_name)

    return index

def initialize_embeddings():
    embeddings = OllamaEmbeddings(
        model="mxbai-embed-large:335m"
    )

    return embeddings

def split_documents(directory):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )


    directory_list = os.listdir(directory)

    all_docs = []

    for name in directory_list:
        with open(os.path.join(directory, name), "r") as f:
            text = f.read()
        
        docs = text_splitter.create_documents([text])

        movie_name = name.split("-")[0].replace(".txt", "")

        for doc in docs:
            doc.metadata = {"movie_name": movie_name}

        all_docs.extend(docs)

    print(f'Number of documents: {len(all_docs)}')

    return all_docs

def ingest_documents(all_docs):

    index = initialize_index()  
    embeddings = initialize_embeddings()

    vector_store = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

    # Upload documents in batches
    batch_size = 400  # Adjust this number if needed
    total_docs = len(all_docs)
    
    for i in range(0, total_docs, batch_size):
        batch = all_docs[i:i + batch_size]
        batch_ids = [j + 1 for j in range(i, min(i + batch_size, total_docs))]
        
        print(f"Uploading batch {i//batch_size + 1}/{(total_docs + batch_size - 1)//batch_size} ({len(batch)} documents)")
        
        vector_store.add_documents(documents=batch, uids=batch_ids)
    
    print(f"Successfully uploaded all {total_docs} documents to Pinecone!")

def main():

    directory = "/Users/icansingh/Desktop/Work/Projects/AI/Marvel Movie Bot/marvel-movie-bot/dataset/script_txts"
    all_docs = split_documents(directory)
    ingest_documents(all_docs)

if __name__ == "__main__":
    main()