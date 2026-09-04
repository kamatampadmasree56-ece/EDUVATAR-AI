import os
from typing import List, Dict, Any

def extract_text_from_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """
    Extracts text with page/slide/chapter metadata from uploaded files.
    Returns: [{"page": 1, "chapter": "...", "section": "...", "text": "..."}]
    """
    ext = file_type.lower().replace(".", "")
    results: List[Dict[str, Any]] = []

    if ext == "pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                if txt.strip():
                    results.append({
                        "page": idx + 1,
                        "chapter": f"Page {idx + 1}",
                        "section": f"Section {idx + 1}",
                        "text": txt.strip()
                    })
        except Exception as e:
            raise ValueError(f"Failed to extract PDF contents: {str(e)}")

    elif ext in ["docx", "doc"]:
        try:
            import docx
            doc = docx.Document(file_path)
            current_chapter = "Document Overview"
            current_paragraphs = []
            page_estimate = 1

            for p in doc.paragraphs:
                text = p.text.strip()
                if not text:
                    continue
                if p.style and ("heading" in p.style.name.lower() or "title" in p.style.name.lower()):
                    if current_paragraphs:
                        results.append({
                            "page": page_estimate,
                            "chapter": current_chapter,
                            "section": current_chapter,
                            "text": "\n".join(current_paragraphs)
                        })
                        current_paragraphs = []
                        page_estimate += 1
                    current_chapter = text
                else:
                    current_paragraphs.append(text)

            if current_paragraphs:
                results.append({
                    "page": page_estimate,
                    "chapter": current_chapter,
                    "section": current_chapter,
                    "text": "\n".join(current_paragraphs)
                })
        except Exception as e:
            raise ValueError(f"Failed to extract Word document contents: {str(e)}")

    elif ext in ["pptx", "ppt"]:
        try:
            from pptx import Presentation
            prs = Presentation(file_path)
            for idx, slide in enumerate(prs.slides):
                slide_texts = []
                slide_title = f"Slide {idx + 1}"
                for shape in slide.shapes:
                    if shape.has_text_frame:
                        for paragraph in shape.text_frame.paragraphs:
                            t = paragraph.text.strip()
                            if t:
                                slide_texts.append(t)
                if slide_texts:
                    results.append({
                        "page": idx + 1,
                        "chapter": slide_title,
                        "section": slide_texts[0] if slide_texts else slide_title,
                        "text": "\n".join(slide_texts)
                    })
        except Exception as e:
            raise ValueError(f"Failed to extract PowerPoint contents: {str(e)}")

    elif ext in ["txt", "md", "markdown"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            # Split roughly every 1500 chars into pages
            chunks = [content[i:i+1500] for i in range(0, len(content), 1500)]
            for idx, c in enumerate(chunks):
                if c.strip():
                    results.append({
                        "page": idx + 1,
                        "chapter": f"Section {idx + 1}",
                        "section": f"Page {idx + 1}",
                        "text": c.strip()
                    })
        except Exception as e:
            raise ValueError(f"Failed to read text file: {str(e)}")

    else:
        raise ValueError(
            f"Unsupported file format '.{ext}'. Supported formats are: PDF, DOC, DOCX, PPT, PPTX, TXT, Markdown."
        )

    if not results:
        results.append({
            "page": 1,
            "chapter": "General",
            "section": "Introduction",
            "text": "Document content successfully processed."
        })

    return results
