import os
import io
from typing import List


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a PDF using multiple engines for maximum compatibility.
    Falls back to Tesseract OCR for scanned / image-based PDFs.
    """

    # Engine 1: PyMuPDF (fitz) — most powerful, handles widest range of PDFs
    try:
        import fitz  # pymupdf
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        text = text.strip()
        if text:
            print(f"[PDF] Extracted via PyMuPDF: {len(text)} chars")
            return text
    except Exception as e:
        print(f"[PDF] PyMuPDF failed: {e}")

    # Engine 2: pdfplumber — great for complex layouts and tables
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        text = text.strip()
        if text:
            print(f"[PDF] Extracted via pdfplumber: {len(text)} chars")
            return text
    except Exception as e:
        print(f"[PDF] pdfplumber failed: {e}")

    # Engine 3: pypdf — lightweight fallback
    try:
        from pypdf import PdfReader
        text = ""
        with open(pdf_path, "rb") as f:
            reader = PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        text = text.strip()
        if text:
            print(f"[PDF] Extracted via pypdf: {len(text)} chars")
            return text
    except Exception as e:
        print(f"[PDF] pypdf failed: {e}")

    # Engine 4: Tesseract OCR — for scanned / image-based PDFs
    try:
        import pytesseract
        import fitz  # pymupdf renders pages as images
        from PIL import Image

        # Auto-detect Tesseract installation path on Windows
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break

        doc = fitz.open(pdf_path)
        text = ""
        print(f"[OCR] Running Tesseract on {len(doc)} page(s)...")
        for page_num, page in enumerate(doc):
            # Render at 300 DPI for good OCR accuracy
            mat = fitz.Matrix(300 / 72, 300 / 72)
            pix = page.get_pixmap(matrix=mat)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            page_text = pytesseract.image_to_string(img, lang="eng")
            text += page_text + "\n"
            print(f"[OCR] Page {page_num + 1}: {len(page_text)} chars extracted")
        doc.close()
        text = text.strip()
        if text:
            print(f"[OCR] Total extracted: {len(text)} chars")
            return text
    except Exception as e:
        print(f"[OCR] Tesseract OCR failed: {e}")

    print("[PDF] All engines failed to extract text.")
    return ""


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Chunks text into smaller segments. Returns empty list if text is empty."""
    words = text.split()
    if not words:
        return []
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size]).strip()
        if chunk:
            chunks.append(chunk)
    return chunks
