
def split_text(text, chunk_size=500, overlap=100):
    """
    Split text into overlapping chunks.

    chunk_size and overlap are measured in words.
    """

    words = text.split()

    if not words:
        return []

    if overlap >= chunk_size:
        raise ValueError("Overlap must be smaller than chunk size.")

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size

        chunk = " ".join(words[start:end])

        if chunk.strip():
            chunks.append(chunk)

        if end >= len(words):
            break

        start = end - overlap

    return chunks

def create_document_chunks(documents):
    all_chunks = []

    for document in documents:
        text_chunks = split_text(document["text"])

        for index, chunk in enumerate(text_chunks):
            all_chunks.append({
                "text": chunk,
                "metadata": {
                    **document["metadata"],
                    "chunk": index + 1
                }
            })

    return all_chunks