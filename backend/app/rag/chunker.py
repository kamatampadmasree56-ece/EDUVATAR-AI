from typing import List, Dict, Any

def create_chunks(
    extracted_sections: List[Dict[str, Any]],
    chunk_size: int = 600,
    chunk_overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Splits text into chunks while preserving page, chapter, and section metadata.
    """
    chunks: List[Dict[str, Any]] = []
    chunk_index = 0

    for item in extracted_sections:
        page = item.get("page", 1)
        chapter = item.get("chapter", "General")
        section = item.get("section", "")
        text = item.get("text", "").strip()

        if not text:
            continue

        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + chunk_size, text_len)
            
            # If not at the very end of text, attempt to break cleanly at sentence or word boundary
            if end < text_len:
                last_period = text.rfind(".", start + 200, end)
                if last_period != -1:
                    end = last_period + 1
                else:
                    last_space = text.rfind(" ", start + 200, end)
                    if last_space != -1:
                        end = last_space

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page,
                    "chapter": chapter,
                    "section_title": section,
                    "content": chunk_text,
                    "metadata": {
                        "page": page,
                        "chapter": chapter,
                        "section": section,
                        "char_count": len(chunk_text)
                    }
                })
                chunk_index += 1

            if end >= text_len:
                break
            start = max(start + 1, end - chunk_overlap)

    return chunks
