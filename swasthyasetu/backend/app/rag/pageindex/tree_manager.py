import os
import json
from typing import Dict, Any, Optional

class TreeManager:
    """
    Manages loading, updating, and saving versioned PageIndex trees.
    """
    def __init__(self, storage_dir: Optional[str] = None):
        if not storage_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            storage_dir = os.path.join(base_dir, "data", "pageindex", "trees")
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def get_tree(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        file_path = os.path.join(self.storage_dir, f"tree_{scheme_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_tree(self, scheme_id: str, tree_data: Dict[str, Any]) -> str:
        file_path = os.path.join(self.storage_dir, f"tree_{scheme_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(tree_data, f, indent=2)
        return file_path
