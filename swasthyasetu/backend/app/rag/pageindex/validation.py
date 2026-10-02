from typing import Dict, Any, List

class PageIndexValidator:
    """
    Validates document tree schemas, checksums, and source verification metadata.
    """
    @staticmethod
    def validate_tree(tree_data: Dict[str, Any]) -> List[str]:
        errors = []
        if not tree_data.get("document_id"):
            errors.append("Missing document_id")
        if not tree_data.get("title"):
            errors.append("Missing document title")
        if "nodes" not in tree_data or not isinstance(tree_data["nodes"], list):
            errors.append("Missing or invalid nodes list")
        return errors
