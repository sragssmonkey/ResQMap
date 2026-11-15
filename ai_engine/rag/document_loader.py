
from pathlib import Path
from pypdf import PdfReader

DOCUMENTS_DIR = (
    Path(__file__).resolve().parent.parent
    / "knowledge_base"
    / "documents"
)

def load_pdf_documents():
    documents = []

    for pdf_path in DOCUMENTS_DIR.glob("*.pdf"):
        try:
            reader = PdfReader(str(pdf_path))

            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""

                if text.strip():
                    documents.append({
                        "text": text,
                        "metadata": {
                            "source": pdf_path.name,
                            "page": page_number,
                            "file_type": "pdf"
                        }
                    })

            print(f"Loaded: {pdf_path.name}")

        except Exception as error:
            print(f"Could not load {pdf_path.name}: {error}")

    return documents