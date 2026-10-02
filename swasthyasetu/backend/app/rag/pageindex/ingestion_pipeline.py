import os
import logging
from typing import Dict, Any
from app.rag.pageindex.document_loader import DocumentLoader
from app.rag.pageindex.document_parser import DocumentParser
from app.rag.pageindex.tree_manager import TreeManager

logger = logging.getLogger("ingestion_pipeline")

class IngestionPipeline:
    """
    Idempotent document ingestion pipeline building PageIndex trees.
    """
    def __init__(self, data_dir: str):
        self.tree_manager = TreeManager(os.path.join(data_dir, "pageindex", "trees"))

    def ingest_document(self, file_path: str, scheme_id: str, title: str) -> Dict[str, Any]:
        doc_info = DocumentLoader.load_from_file(file_path)
        tree_data = DocumentParser.parse_into_sections(doc_info["content"], scheme_id, title)
        saved_path = self.tree_manager.save_tree(scheme_id, tree_data)

        return {
            "scheme_id": scheme_id,
            "document_id": f"pid-{scheme_id}",
            "checksum": doc_info["checksum"],
            "saved_tree_path": saved_path,
            "status": "COMPLETED",
            "section_count": len(tree_data.get("nodes", []))
        }
