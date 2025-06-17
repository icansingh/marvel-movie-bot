from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings

with open("dataset/script_txts/avengers-endgame-script-slug.txt", "r") as f:
    text = f.read()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)

texts = text_splitter.create_documents([text])

print(f'Number of chunks: {len(texts)}')

print(f'First chunk: {texts[3].page_content}')

embeddings = OllamaEmbeddings(
    model="mxbai-embed-large:335m"
)

text_to_embed = texts[3].page_content

embedding = embeddings.embed_query(text_to_embed)

print(f'Embedding: {str(embedding)}')