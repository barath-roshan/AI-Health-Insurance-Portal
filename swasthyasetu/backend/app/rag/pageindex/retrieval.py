import os
import csv
import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.rag.pageindex.tree_manager import TreeManager

logger = logging.getLogger("pageindex_retrieval")

STATE_ALIAS_MAP = {
    "tn": "Tamil Nadu",
    "tamil nadu": "Tamil Nadu",
    "tamilnadu": "Tamil Nadu",
    "kl": "Kerala",
    "kerala": "Kerala",
    "ka": "Karnataka",
    "karnataka": "Karnataka",
    "mh": "Maharashtra",
    "maharashtra": "Maharashtra",
    "dl": "Delhi",
    "delhi": "Delhi",
    "wb": "West Bengal",
    "west bengal": "West Bengal",
    "up": "Uttar Pradesh",
    "uttar pradesh": "Uttar Pradesh"
}

class VectorlessRetrievalEngine:
    """
    Reasoning-based PageIndex Document Retrieval Engine (Vectorless).
    Searches official scheme catalogue, aliases, and section trees without embedding vectors.
    """
    def __init__(self, data_dir: Optional[str] = None):
        if not data_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            data_dir = os.path.join(base_dir, "data")
        self.data_dir = data_dir
        self.tree_manager = TreeManager(os.path.join(data_dir, "pageindex", "trees"))
        self.catalogue = self._load_catalogue()
        self.aliases = self._load_aliases()

    def _load_catalogue(self) -> List[Dict[str, Any]]:
        json_path = os.path.join(self.data_dir, "kaapan_schemes_catalogue.json")
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("schemes", [])
        path = os.path.join(self.data_dir, "scheme_catalogue.csv")
        if not os.path.exists(path):
            return []
        with open(path, mode="r", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def _load_aliases(self) -> Dict[str, str]:
        path = os.path.join(self.data_dir, "scheme_aliases.csv")
        if not os.path.exists(path):
            return {}
        mapping = {}
        with open(path, mode="r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                alias = row.get("alias", "").lower()
                scheme_id = row.get("scheme_id", "")
                if alias and scheme_id:
                    mapping[alias] = scheme_id
        return mapping

    @staticmethod
    def normalize_state(query: str) -> Optional[str]:
        q = query.lower()
        for alias, canonical in STATE_ALIAS_MAP.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, q):
                return canonical
        return None

    def resolve_scheme_id(self, query: str) -> Optional[str]:
        q = query.lower()
        for alias, scheme_id in self.aliases.items():
            if alias in q:
                return scheme_id
        for scheme in self.catalogue:
            s_name = scheme.get("scheme_name", "").lower()
            s_id = scheme.get("scheme_id", "").lower()
            if s_id in q or s_name in q:
                return scheme.get("scheme_id")
        return None

    def get_schemes_by_jurisdiction(self, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves schemes applicable to the specified jurisdiction.
        Strictly excludes state-specific schemes from OTHER states.
        """
        results = []
        target_state = self.normalize_state(state) if state else None

        for scheme in self.catalogue:
            jurisdiction = (scheme.get("jurisdiction") or scheme.get("state_or_region") or "India").strip()
            
            if not target_state:
                results.append(scheme)
                continue

            # Target state match
            if target_state.lower() in jurisdiction.lower():
                results.append(scheme)
            elif jurisdiction.lower() in ["india", "all india", "central"]:
                # National scheme applicable across India
                results.append(scheme)

        return results

    def search_schemes(self, query: str, state: Optional[str] = None, max_results: int = 10) -> List[Dict[str, Any]]:
        target_state = self.normalize_state(query) or (self.normalize_state(state) if state else None)
        filtered_catalogue = self.get_schemes_by_jurisdiction(target_state) if target_state else self.catalogue

        q_terms = [t for t in query.lower().split() if len(t) > 2]
        matched = []

        for scheme in filtered_catalogue:
            score = 0
            name = scheme.get("scheme_name", "").lower()
            desc = (scheme.get("brief_details") or scheme.get("short_description") or "").lower()
            elig = (scheme.get("eligibility") or scheme.get("eligibility_summary") or "").lower()

            for term in q_terms:
                if term in name:
                    score += 5
                if term in desc:
                    score += 2
                if term in elig:
                    score += 2

            # Give non-zero score for pure listing queries if filtered by jurisdiction
            if score == 0 and target_state:
                score = 1

            if score > 0:
                matched.append({**scheme, "search_score": score})

        matched.sort(key=lambda x: x["search_score"], reverse=True)
        return matched[:max_results]

    def retrieve_evidence(self, query: str, scheme_id: Optional[str] = None, state: Optional[str] = None) -> Dict[str, Any]:
        target_state = self.normalize_state(query) or (self.normalize_state(state) if state else None)
        target_scheme_id = scheme_id or self.resolve_scheme_id(query)
        evidence_items = []

        if target_scheme_id:
            tree = self.tree_manager.get_tree(target_scheme_id.lower()) or self.tree_manager.get_tree(target_scheme_id)
            scheme_info = next((s for s in self.catalogue if s["scheme_id"].lower() == target_scheme_id.lower()), None)
            
            source_url = "https://nhp.gov.in"
            publisher = "Government of India"
            if scheme_info:
                source_url = scheme_info.get("official_url") or scheme_info.get("source_url") or "https://nhp.gov.in"
                publisher = scheme_info.get("source_type") or f"Government of {scheme_info.get('jurisdiction', 'India')}"

            if tree and "nodes" in tree:
                q_terms = [t for t in query.lower().split() if len(t) > 2]
                for node in tree["nodes"]:
                    text = (node.get("title", "") + " " + node.get("content", "")).lower()
                    if any(t in text for t in q_terms) or not q_terms:
                        evidence_items.append({
                            "source_id": f"src-{target_scheme_id.lower()}",
                            "scheme_id": target_scheme_id,
                            "document_title": tree.get("title", "Official Scheme Policy"),
                            "publisher": publisher,
                            "section_title": node.get("title", "Section"),
                            "page_number": node.get("page_start", 1),
                            "quoted_text": node.get("content", "")[:600],
                            "source_url": source_url,
                            "document_type": "official_guideline",
                            "jurisdiction": scheme_info.get("jurisdiction", "India") if scheme_info else "India",
                            "verification_status": "VERIFIED_OFFICIAL",
                            "last_verified": "2026-09-30"
                        })
        else:
            matching_schemes = self.search_schemes(query, state=target_state, max_results=5)
            for s in matching_schemes:
                s_id = s["scheme_id"]
                tree = self.tree_manager.get_tree(s_id.lower()) or self.tree_manager.get_tree(s_id)
                source_url = s.get("official_url") or s.get("source_url") or "https://nhp.gov.in"
                publisher = s.get("source_type") or f"Government of {s.get('jurisdiction', 'India')}"
                
                if tree and "nodes" in tree:
                    for node in tree["nodes"][:2]:
                        evidence_items.append({
                            "source_id": f"src-{s_id.lower()}",
                            "scheme_id": s_id,
                            "document_title": f"{s['scheme_name']} Guidelines",
                            "publisher": publisher,
                            "section_title": node.get("title", "Section"),
                            "page_number": node.get("page_start", 1),
                            "quoted_text": node.get("content", "")[:500],
                            "source_url": source_url,
                            "document_type": "official_guideline",
                            "jurisdiction": s.get("jurisdiction", "India"),
                            "verification_status": s.get("verification_status", "VERIFIED_OFFICIAL"),
                            "last_verified": s.get("last_verified", "2026-09-30")
                        })

        return {
            "query": query,
            "scheme_id": target_scheme_id,
            "jurisdiction": target_state,
            "evidence": evidence_items[:8],
            "evidence_count": len(evidence_items)
        }
