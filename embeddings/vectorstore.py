import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
import uuid

class VectorStore:
    def __init__(self, collection_name: str = "legal_docs"):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def add_documents(self, documents: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]] = None):
        """Adds documents and their embeddings to the collection."""
        ids = [str(uuid.uuid4()) for _ in range(len(documents))]
        if metadatas is None:
            metadatas = [{"source": "unknown"} for _ in range(len(documents))]
        
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    def query(self, query_embedding: List[float], n_results: int = 5) -> Dict[str, Any]:
        """Queries the collection for similar documents."""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
