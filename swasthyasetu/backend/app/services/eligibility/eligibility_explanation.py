from typing import List, Dict, Any

def generate_eligibility_explanation(
    status: str,
    satisfied_rules: List[Dict[str, Any]],
    failed_rules: List[Dict[str, Any]],
    missing_fields: List[str],
    scheme_name: str
) -> List[str]:
    """
    Generates a structured list of bullet explanations prefixed with checkmarks, cross marks, or question marks.
    """
    explanations = []

    if status == "ELIGIBLE":
        for rule in satisfied_rules:
            desc = rule.get("description") or f"{rule.get('field_name')} requirement satisfied"
            explanations.append(f"✓ {desc}")
        if not explanations:
            explanations.append("✓ All scheme eligibility criteria fully satisfied")

    elif status == "NOT_ELIGIBLE":
        for rule in failed_rules:
            desc = rule.get("reason") or rule.get("description") or f"{rule.get('field_name')} criterion not satisfied"
            explanations.append(f"✗ {desc}")
        for rule in satisfied_rules:
            desc = rule.get("description") or f"{rule.get('field_name')} requirement satisfied"
            explanations.append(f"✓ {desc}")

    elif status == "NEEDS_INFORMATION":
        for field in missing_fields:
            explanations.append(f"? {field.replace('_', ' ').title()} is required to determine eligibility")
        for rule in satisfied_rules:
            desc = rule.get("description") or f"{rule.get('field_name')} requirement satisfied"
            explanations.append(f"✓ {desc}")
        for rule in failed_rules:
            desc = rule.get("reason") or rule.get("description") or f"{rule.get('field_name')} criterion not satisfied"
            explanations.append(f"✗ {desc}")

    elif status == "NEAR_MATCH":
        for rule in failed_rules:
            desc = rule.get("reason") or rule.get("description") or f"{rule.get('field_name')} near threshold"
            explanations.append(f"⚡ {desc}")
        for rule in satisfied_rules:
            desc = rule.get("description") or f"{rule.get('field_name')} requirement satisfied"
            explanations.append(f"✓ {desc}")
        for field in missing_fields:
            explanations.append(f"? {field.replace('_', ' ').title()} needs confirmation")

    return explanations
