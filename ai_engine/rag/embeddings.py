
import requests

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"


def generate_embedding(text, task="document"):
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text.")

    prefix = (
        "search_query: "
        if task == "query"
        else "search_document: "
    )

    response = requests.post(
        OLLAMA_EMBED_URL,
        json={
            "model": EMBEDDING_MODEL,
            "prompt": prefix + text.strip()
        },
        timeout=120
    )

    response.raise_for_status()

    embedding = response.json().get("embedding")

    if not embedding:
        raise ValueError("Ollama returned an empty embedding.")

    return embedding


def generate_embeddings(texts):
    return [
        generate_embedding(text, task="document")
        for text in texts
    ]


def generate_query_embedding(text):
    return generate_embedding(text, task="query")
