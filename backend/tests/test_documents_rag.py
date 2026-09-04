import io

def test_document_upload_and_rag_pipeline(client, auth_headers):
    markdown_content = """# Chapter 1: Electric Circuits and Ohm's Law
Electricity is the flow of electric charge.
The relationship between Voltage (V), Current (I), and Resistance (R) is described by Ohm's Law:
V = I * R.
Where V is in Volts, I is in Amperes, and R is in Ohms.
If resistance increases while voltage is kept constant, current decreases proportionally.
"""
    file_bytes = io.BytesIO(markdown_content.encode("utf-8"))

    # Upload document
    res = client.post(
        "/api/documents/upload",
        files={"file": ("circuits_guide.md", file_bytes, "text/markdown")},
        data={"subject": "Physics"},
        headers=auth_headers
    )
    assert res.status_code == 200
    doc_data = res.json()
    assert doc_data["title"] == "Circuits Guide"
    assert doc_data["subject"] == "Physics"
    assert doc_data["total_chunks"] >= 1
    doc_id = doc_data["id"]

    # List documents
    list_res = client.get("/api/documents", headers=auth_headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["id"] == doc_id for d in docs)

    # Document details
    detail_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["chunks"]) >= 1

    # Query RAG
    query_res = client.post(
        "/api/documents/query",
        json={"query": "What is the relationship between voltage and current?", "document_id": doc_id, "top_k": 3},
        headers=auth_headers
    )
    assert query_res.status_code == 200
    citations = query_res.json()
    assert isinstance(citations, list)
    assert len(citations) >= 1
    assert "snippet" in citations[0]

    # Delete document
    del_res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]

def test_document_upload_unsupported_type(client, auth_headers):
    file_bytes = io.BytesIO(b"executable content")
    res = client.post(
        "/api/documents/upload",
        files={"file": ("malicious.exe", file_bytes, "application/octet-stream")},
        headers=auth_headers
    )
    assert res.status_code == 400
    assert "Unsupported format" in res.json()["detail"]
