
import chromadb
from pathlib import Path

from ai_engine.rag.embeddings import generate_embeddings


# Store the database inside the ai_engine application
VECTOR_DB_PATH = (
    Path(__file__).resolve().parent.parent
    / "knowledge_base"
    / "chroma_db"
)

COLLECTION_NAME = "resq_disaster_knowledge"


# Create a persistent ChromaDB client
client = chromadb.PersistentClient(
    path=str(VECTOR_DB_PATH)
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)


def add_chunks(chunks):
    """
    Generate embeddings and store document chunks
    with their source metadata in ChromaDB.
    """

    if not chunks:
        return 0

    texts = [chunk["text"] for chunk in chunks]

    embeddings = generate_embeddings(texts)

    ids = []
    metadatas = []

    for index, chunk in enumerate(chunks):
        metadata = chunk["metadata"]

        document_id = (
            f"{metadata['source']}_"
            f"{metadata['page']}_"
            f"{metadata['chunk']}"
        )

        ids.append(document_id)
        metadatas.append(metadata)

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(chunks)


def get_collection_count():
    """
    Return the total number of stored chunks.
    """

    return collection.count()
