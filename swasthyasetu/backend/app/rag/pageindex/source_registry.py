import os
import csv
from typing import Dict, Any, List, Optional

class SourceRegistry:
    """
    Manages registered official document sources and verification metadata.
    """
    def __init__(self, registry_csv: Optional[str] = None):
        if not registry_csv:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            registry_csv = os.path.join(base_dir, "data", "source_registry.csv")
        self.registry_csv = registry_csv

    def get_all_sources(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.registry_csv):
            return []
        with open(self.registry_csv, mode="r", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def get_source_by_id(self, source_id: str) -> Optional[Dict[str, Any]]:
        sources = self.get_all_sources()
        for src in sources:
            if src.get("source_id") == source_id:
                return src
        return None
