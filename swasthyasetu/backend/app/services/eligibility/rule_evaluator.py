import json
from typing import Dict, Any, Tuple

def evaluate_single_rule(
    field_name: str,
    operator: str,
    expected_value: str,
    profile: Dict[str, Any]
) -> Tuple[str, str]:
    """
    Evaluates a single rule against a profile dict.
    Returns (result_status, description_reason)
    result_status can be: "PASSED", "FAILED", or "MISSING_FIELD"
    """
    field_key = field_name.strip().lower()
    op = operator.strip().upper()
    exp_str = str(expected_value).strip()

    # Map aliases for scheme fields
    field_alias_map = {
        "annual_income": "annual_income",
        "income": "annual_income",
        "age": "age",
        "state": "state",
        "region": "state",
        "state_or_region": "state",
        "district": "district",
        "gender": "gender",
        "occupation": "occupation",
        "family_size": "family_size"
    }

    target_field = field_alias_map.get(field_key, field_key)
    actual_value = profile.get(target_field)

    # Missing field check
    if actual_value is None:
        return "MISSING_FIELD", f"{field_name} is required but missing from citizen profile"

    # Evaluate based on operator
    try:
        if op == "=" or op == "==":
            if isinstance(actual_value, (int, float)):
                exp_num = float(exp_str)
                if float(actual_value) == exp_num:
                    return "PASSED", f"{field_name} ({actual_value}) equals expected {exp_str}"
                else:
                    return "FAILED", f"{field_name} ({actual_value}) does not equal expected {exp_str}"
            else:
                if str(actual_value).strip().lower() == exp_str.lower():
                    return "PASSED", f"{field_name} ('{actual_value}') matches '{exp_str}'"
                else:
                    return "FAILED", f"{field_name} ('{actual_value}') does not match '{exp_str}'"

        elif op == "!=":
            if isinstance(actual_value, (int, float)):
                exp_num = float(exp_str)
                if float(actual_value) != exp_num:
                    return "PASSED", f"{field_name} ({actual_value}) is not equal to {exp_str}"
                else:
                    return "FAILED", f"{field_name} ({actual_value}) equals {exp_str}"
            else:
                if str(actual_value).strip().lower() != exp_str.lower():
                    return "PASSED", f"{field_name} ('{actual_value}') is not '{exp_str}'"
                else:
                    return "FAILED", f"{field_name} ('{actual_value}') is equal to '{exp_str}'"

        elif op == ">":
            actual_num = float(actual_value)
            exp_num = float(exp_str)
            if actual_num > exp_num:
                return "PASSED", f"{field_name} ({actual_num}) > {exp_num}"
            else:
                return "FAILED", f"{field_name} ({actual_num}) is not > {exp_num}"

        elif op == ">=":
            actual_num = float(actual_value)
            exp_num = float(exp_str)
            if actual_num >= exp_num:
                return "PASSED", f"{field_name} ({actual_num}) >= {exp_num}"
            else:
                return "FAILED", f"{field_name} ({actual_num}) is less than required minimum {exp_num}"

        elif op == "<":
            actual_num = float(actual_value)
            exp_num = float(exp_str)
            if actual_num < exp_num:
                return "PASSED", f"{field_name} ({actual_num}) < {exp_num}"
            else:
                return "FAILED", f"{field_name} ({actual_num}) exceeds limit {exp_num}"

        elif op == "<=":
            actual_num = float(actual_value)
            exp_num = float(exp_str)
            if actual_num <= exp_num:
                return "PASSED", f"{field_name} ({actual_num}) <= maximum income/threshold {exp_num}"
            else:
                return "FAILED", f"{field_name} ({actual_num}) exceeds maximum allowed threshold of {exp_num}"

        elif op == "IN":
            # Parse expected_value as JSON list or comma-separated values
            try:
                allowed_items = json.loads(exp_str)
                if not isinstance(allowed_items, list):
                    allowed_items = [str(allowed_items)]
            except Exception:
                allowed_items = [item.strip() for item in exp_str.replace("[", "").replace("]", "").replace('"', "").replace("'", "").split(",")]

            allowed_lower = [str(x).strip().lower() for x in allowed_items]
            actual_str = str(actual_value).strip().lower()

            if actual_str in allowed_lower:
                return "PASSED", f"{field_name} ('{actual_value}') is among allowed categories {allowed_items}"
            else:
                return "FAILED", f"{field_name} ('{actual_value}') is not in allowed list {allowed_items}"

        else:
            return "FAILED", f"Unsupported rule operator: {operator}"

    except ValueError as ve:
        return "FAILED", f"Data format mismatch for {field_name} ({actual_value}) vs {exp_str}: {ve}"
