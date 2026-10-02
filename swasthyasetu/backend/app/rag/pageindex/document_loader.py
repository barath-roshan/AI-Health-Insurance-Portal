import os
import hashlib
from typing import Dict, Any

class DocumentLoader:
    """
    Loads document sources (PDF, HTML, TXT) and generates cryptographic checksums.
    """
    @staticmethod
    def compute_checksum(content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def load_from_file(file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document file not found: {file_path}")

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        checksum = DocumentLoader.compute_checksum(content)
        return {
            "file_path": file_path,
            "filename": os.path.basename(file_path),
            "content": content,
            "checksum": checksum,
            "size_bytes": os.path.getsize(file_path)
        }
