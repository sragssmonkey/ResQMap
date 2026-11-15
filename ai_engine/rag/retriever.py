
from ai_engine.rag.embeddings import generate_query_embedding
from ai_engine.rag.vector_store import collection


def retrieve_relevant_chunks(question, top_k=3):
    """
    Retrieve the most relevant document chunks
    for a user's question.
    """

    if not question or not question.strip():
        return []

    query_embedding = generate_query_embedding(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    retrieved_chunks = []

    if not results["documents"]:
        return []

    for text, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        retrieved_chunks.append({
            "text": text,
            "source": metadata.get("source"),
            "page": metadata.get("page"),
            "distance": distance
        })

    return retrieved_chunks
