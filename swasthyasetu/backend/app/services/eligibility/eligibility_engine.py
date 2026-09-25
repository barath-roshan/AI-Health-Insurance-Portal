from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Scheme, EligibilityRule
from app.services.eligibility.profile_validator import validate_and_normalize_profile
from app.services.eligibility.rule_evaluator import evaluate_single_rule
from app.services.eligibility.eligibility_explanation import generate_eligibility_explanation

def evaluate_scheme_eligibility(
    scheme: Scheme,
    profile_dict: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates a single scheme against a citizen profile.
    Deterministic decision logic — NO LLMs used.
    """
    satisfied_rules = []
    failed_rules = []
    missing_fields = []

    # 1. State / Region check
    scheme_region = (scheme.state_or_region or "All India").strip()
    profile_state = profile_dict.get("state")

    if scheme_region.lower() not in ["all india", "india", "central"]:
        if not profile_state:
            missing_fields.append("state")
        elif scheme_region.lower() not in profile_state.lower() and profile_state.lower() not in scheme_region.lower():
            failed_rules.append({
                "field_name": "state",
                "operator": "=",
                "expected_value": scheme_region,
                "reason": f"Scheme is specific to '{scheme_region}', but citizen profile state is '{profile_state}'"
            })
        else:
            satisfied_rules.append({
                "field_name": "state",
                "operator": "=",
                "expected_value": scheme_region,
                "description": f"State match satisfied ({profile_state})"
            })
    else:
        satisfied_rules.append({
            "field_name": "state",
            "operator": "=",
            "expected_value": scheme_region,
            "description": f"Applicable nationwide ({scheme_region})"
        })

    # 2. Database EligibilityRules check
    rules: List[EligibilityRule] = scheme.rules or []
    for rule in rules:
        res_status, res_reason = evaluate_single_rule(
            field_name=rule.field_name,
            operator=rule.operator,
            expected_value=rule.expected_value,
            profile=profile_dict
        )

        rule_info = {
            "id": rule.id,
            "field_name": rule.field_name,
            "operator": rule.operator,
            "expected_value": rule.expected_value,
            "description": rule.description or res_reason,
            "reason": res_reason
        }

        if res_status == "PASSED":
            satisfied_rules.append(rule_info)
        elif res_status == "FAILED":
            # Check NEAR_MATCH boundary for annual_income
            if rule.field_name in ["annual_income", "income"] and rule.operator in ["<=", "<"]:
                try:
                    exp_num = float(rule.expected_value)
                    user_inc = float(profile_dict.get("annual_income", 0))
                    if user_inc <= exp_num * 1.15:  # Within 15% tolerance
                        rule_info["is_near_match"] = True
                except Exception:
                    pass
            failed_rules.append(rule_info)
        elif res_status == "MISSING_FIELD":
            if rule.field_name not in missing_fields:
                missing_fields.append(rule.field_name)

    # 3. Determine Overall Status
    near_match_failures = [r for r in failed_rules if r.get("is_near_match")]
    hard_failures = [r for r in failed_rules if not r.get("is_near_match")]

    if len(hard_failures) > 0:
        status = "NOT_ELIGIBLE"
    elif len(near_match_failures) > 0 and len(hard_failures) == 0:
        status = "NEAR_MATCH"
    elif len(missing_fields) > 0:
        status = "NEEDS_INFORMATION"
    else:
        status = "ELIGIBLE"

    explanation = generate_eligibility_explanation(
        status=status,
        satisfied_rules=satisfied_rules,
        failed_rules=failed_rules,
        missing_fields=missing_fields,
        scheme_name=scheme.scheme_name
    )

    return {
        "scheme_id": scheme.id,
        "scheme_code": scheme.scheme_code,
        "scheme_name": scheme.scheme_name,
        "category": scheme.category,
        "state_or_region": scheme.state_or_region,
        "status": status,
        "satisfied_rules": satisfied_rules,
        "failed_rules": failed_rules,
        "missing_fields": missing_fields,
        "explanation": explanation,
        "benefits": scheme.benefits
    }


def evaluate_all_schemes_for_profile(
    db: Session,
    profile_data: Any
) -> List[Dict[str, Any]]:
    """
    Evaluates profile against all active schemes in PostgreSQL database.
    """
    profile_dict, missing_fields, is_valid = validate_and_normalize_profile(profile_data)
    schemes = db.query(Scheme).filter(Scheme.status == "active").all()

    results = []
    for scheme in schemes:
        res = evaluate_scheme_eligibility(scheme, profile_dict)
        results.append(res)

    # Sort results: ELIGIBLE first, then NEAR_MATCH, then NEEDS_INFORMATION, then NOT_ELIGIBLE
    status_priority = {
        "ELIGIBLE": 1,
        "NEAR_MATCH": 2,
        "NEEDS_INFORMATION": 3,
        "NOT_ELIGIBLE": 4
    }
    results.sort(key=lambda x: (status_priority.get(x["status"], 5), x["scheme_name"]))
    return results
