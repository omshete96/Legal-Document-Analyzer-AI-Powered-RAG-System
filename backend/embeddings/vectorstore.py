import chromadb
import os
from typing import List, Dict, Any
import uuid
import re

# Use persistent Render disk in production, local folder in dev
_CHROMA_PATH = os.environ.get("CHROMA_PATH", "./chroma_db")


def _safe_collection_name(filename: str) -> str:
    """Convert a filename to a valid ChromaDB collection name."""
    # Remove extension, replace unsafe chars with underscores
    name = re.sub(r'\.[^.]+$', '', filename)          # strip extension
    name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)      # safe chars only
    name = name[:60]                                   # max 63 chars
    name = name.strip('_-')
    if len(name) < 3:
        name = "doc_" + name
    return name.lower()


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=_CHROMA_PATH)
        self._current_collection_name: str = None
        self._collection = None

    def _get_collection(self, name: str):
        if self._collection is None or self._current_collection_name != name:
            self._current_collection_name = name
            self._collection = self.client.get_or_create_collection(name=name)
        return self._collection

    def clear_and_use(self, filename: str):
        """Delete any existing collection for this file and create a fresh one."""
        name = _safe_collection_name(filename)
        try:
            self.client.delete_collection(name=name)
        except Exception:
            pass  # collection didn't exist yet
        self._collection = None
        self._current_collection_name = None
        return self._get_collection(name)

    def add_documents(
        self,
        filename: str,
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]] = None,
    ):
        """Add documents to the collection dedicated to this file."""
        collection = self._get_collection(_safe_collection_name(filename))
        ids = [str(uuid.uuid4()) for _ in documents]
        if metadatas is None:
            metadatas = [{"source": filename} for _ in documents]
        collection.add(documents=documents, embeddings=embeddings, metadatas=metadatas, ids=ids)

    def query(
        self,
        filename: str,
        query_embedding: List[float],
        n_results: int = 5,
    ) -> Dict[str, Any]:
        """Query only the collection for the given file."""
        collection = self._get_collection(_safe_collection_name(filename))
        count = collection.count()
        # Don't request more results than we have documents
        n = min(n_results, count) if count > 0 else 1
        return collection.query(query_embeddings=[query_embedding], n_results=n)
