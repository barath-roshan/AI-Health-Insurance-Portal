import os
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("pageindex_client")

class PageIndexClient:
    """
    Vectorless PageIndex Document Tree Retrieval & Parsing API Client.
    Uses official tree-structured navigation instead of vector embeddings.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 10.0
    ):
        self.api_key = api_key or os.getenv("PAGEINDEX_API_KEY", "")
        self.base_url = base_url or os.getenv("PAGEINDEX_BASE_URL", "https://api.pageindex.ai/v1")
        self.timeout = float(os.getenv("PAGEINDEX_TIMEOUT_SECONDS", str(timeout)))

    async def create_document_tree(self, document_id: str, content: str, title: str) -> Dict[str, Any]:
        """
        Submits document text/PDF to PageIndex service to build a hierarchical section tree.
        """
        if not self.api_key:
            logger.info(f"PAGEINDEX_API_KEY not configured. Generating local structured tree for {document_id}.")
            return self._build_local_tree(document_id, title, content)

        url = f"{self.base_url.rstrip('/')}/trees"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"document_id": document_id, "title": title, "text": content}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200 or res.status_code == 201:
                    return res.json()
                logger.warning(f"PageIndex API returned HTTP {res.status_code}: {res.text}. Falling back to local tree structure.")
                return self._build_local_tree(document_id, title, content)
            except Exception as e:
                logger.error(f"PageIndex connection failed: {e}. Falling back to local tree structure.")
                return self._build_local_tree(document_id, title, content)

    async def retrieve_sections(self, tree_data: Dict[str, Any], query: str, max_sections: int = 3) -> List[Dict[str, Any]]:
        """
        Navigates PageIndex section tree deterministically to find relevant sections.
        """
        query_terms = [t.lower() for t in query.split() if len(t) > 2]
        matched_sections = []

        nodes = tree_data.get("nodes", [])
        for node in nodes:
            score = 0
            title = node.get("title", "").lower()
            content = node.get("content", "").lower()

            for term in query_terms:
                if term in title:
                    score += 3
                if term in content:
                    score += 1

            if score > 0:
                matched_sections.append({
                    "section_id": node.get("section_id"),
                    "title": node.get("title"),
                    "page_number": node.get("page_start", 1),
                    "quoted_text": node.get("content"),
                    "score": score
                })

        # Sort by relevance score
        matched_sections.sort(key=lambda x: x["score"], reverse=True)
        return matched_sections[:max_sections]

    def _build_local_tree(self, document_id: str, title: str, content: str) -> Dict[str, Any]:
        return {
            "document_id": document_id,
            "tree_id": f"tree-{document_id}",
            "title": title,
            "nodes": [
                {
                    "section_id": "sec-overview",
                    "title": "1. Scheme Overview",
                    "page_start": 1,
                    "page_end": 1,
                    "content": content[:500] if content else "Official scheme overview."
                },
                {
                    "section_id": "sec-eligibility",
                    "title": "2. Detailed Eligibility Rules",
                    "page_start": 2,
                    "page_end": 3,
                    "content": content[500:1500] if len(content) > 500 else content
                },
                {
                    "section_id": "sec-documents",
                    "title": "3. Required Documents & Procedure",
                    "page_start": 4,
                    "page_end": 5,
                    "content": "Official application guidelines and required documentation."
                }
            ]
        }
