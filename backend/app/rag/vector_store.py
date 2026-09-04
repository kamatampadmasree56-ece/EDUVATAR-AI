import math
from typing import List, Dict, Any, Tuple

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a, b in zip(vec_a, vec_b))) # wait, norm_a is sum(a*a)
    norm_b = math.sqrt(sum(b * b for a, b in zip(vec_a, vec_b))) # wait, let's write cleanly
    return 0.0

class VectorStore:
    """
    In-process vector store supporting cosine similarity ranking over chunks.
    Compatible with any database backing (SQLite or PostgreSQL).
    """

    @staticmethod
    def compute_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b:
            return 0.0
        # If dimensions differ, pad or truncate gracefully
        min_len = min(len(vec_a), len(vec_b))
        if min_len == 0:
            return 0.0
        
        dot = sum(vec_a[i] * vec_b[i] for i in range(min_len))
        mag_a = math.sqrt(sum(vec_a[i] * vec_a[i] for i in range(min_len)))
        mag_b = math.sqrt(sum(vec_b[i] * vec_b[i] for i in range(min_len)))
        
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    @classmethod
    def search(
        cls,
        query_vector: List[float],
        chunks: List[Dict[str, Any]],
        top_k: int = 4
    ) -> List[Tuple[Dict[str, Any], float]]:
        scored = []
        for chunk in chunks:
            chunk_vec = chunk.get("embedding", [])
            score = cls.compute_similarity(query_vector, chunk_vec)
            scored.append((chunk, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
