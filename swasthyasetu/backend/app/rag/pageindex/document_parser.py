import re
from typing import Dict, Any, List

class DocumentParser:
    """
    Parses document text into page-referenced sections without embeddings.
    """
    @staticmethod
    def parse_into_sections(text: str, document_id: str, title: str) -> Dict[str, Any]:
        paragraphs = text.split("\n\n")
        nodes = []
        current_page = 1

        for idx, para in enumerate(paragraphs):
            para = para.strip()
            if not para:
                continue

            section_title = f"Section {idx+1}"
            if re.match(r"^\d+\.\s+", para):
                section_title = para.split("\n")[0][:60]

            nodes.append({
                "section_id": f"sec-{idx+1}",
                "title": section_title,
                "page_start": current_page,
                "page_end": current_page,
                "content": para
            })

            # Rough estimate: 2000 chars per page
            if idx % 3 == 0 and idx > 0:
                current_page += 1

        return {
            "document_id": document_id,
            "tree_id": f"tree-{document_id}",
            "title": title,
            "nodes": nodes
        }
