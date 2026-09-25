from typing import Dict, Any, List, Tuple

REQUIRED_PROFILE_FIELDS = [
    "state",
    "district",
    "age",
    "gender",
    "occupation",
    "annual_income",
    "family_size"
]

def validate_and_normalize_profile(profile_data: Any) -> Tuple[Dict[str, Any], List[str], bool]:
    """
    Normalizes a user profile object/dict and returns:
    (normalized_profile_dict, list_of_missing_fields, is_valid_profile)
    """
    if hasattr(profile_data, "__dict__"):
        p_dict = {
            "state": getattr(profile_data, "state", None),
            "district": getattr(profile_data, "district", None),
            "age": getattr(profile_data, "age", None),
            "gender": getattr(profile_data, "gender", None),
            "occupation": getattr(profile_data, "occupation", None),
            "annual_income": getattr(profile_data, "annual_income", None),
            "family_size": getattr(profile_data, "family_size", None),
            "existing_coverage": getattr(profile_data, "existing_coverage", None),
        }
    elif isinstance(profile_data, dict):
        p_dict = profile_data.copy()
    else:
        p_dict = {}

    normalized = {}
    missing_fields = []

    # State
    state_val = p_dict.get("state")
    if state_val is not None and str(state_val).strip():
        normalized["state"] = str(state_val).strip()
    else:
        missing_fields.append("state")
        normalized["state"] = None

    # District
    dist_val = p_dict.get("district")
    if dist_val is not None and str(dist_val).strip():
        normalized["district"] = str(dist_val).strip()
    else:
        missing_fields.append("district")
        normalized["district"] = None

    # Age
    age_val = p_dict.get("age")
    if age_val is not None and str(age_val).isdigit():
        normalized["age"] = int(age_val)
    elif isinstance(age_val, (int, float)) and age_val >= 0:
        normalized["age"] = int(age_val)
    else:
        missing_fields.append("age")
        normalized["age"] = None

    # Gender
    gender_val = p_dict.get("gender")
    if gender_val is not None and str(gender_val).strip():
        normalized["gender"] = str(gender_val).strip().lower()
    else:
        missing_fields.append("gender")
        normalized["gender"] = None

    # Occupation
    occ_val = p_dict.get("occupation")
    if occ_val is not None and str(occ_val).strip():
        normalized["occupation"] = str(occ_val).strip().lower()
    else:
        missing_fields.append("occupation")
        normalized["occupation"] = None

    # Annual Income
    inc_val = p_dict.get("annual_income")
    if inc_val is not None and str(inc_val).replace(".", "", 1).isdigit():
        normalized["annual_income"] = float(inc_val)
    elif isinstance(inc_val, (int, float)) and inc_val >= 0:
        normalized["annual_income"] = float(inc_val)
    else:
        missing_fields.append("annual_income")
        normalized["annual_income"] = None

    # Family Size
    fam_val = p_dict.get("family_size")
    if fam_val is not None and str(fam_val).isdigit():
        normalized["family_size"] = int(fam_val)
    elif isinstance(fam_val, (int, float)) and fam_val >= 1:
        normalized["family_size"] = int(fam_val)
    else:
        missing_fields.append("family_size")
        normalized["family_size"] = None

    normalized["existing_coverage"] = p_dict.get("existing_coverage")

    is_valid = len(missing_fields) == 0
    return normalized, missing_fields, is_valid
