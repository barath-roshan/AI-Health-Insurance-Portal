import os
import sys
import csv
import logging
from datetime import datetime

logger = logging.getLogger("seeder")

def parse_date(date_str):
    if not date_str:
        return datetime.utcnow()
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.utcnow()

def seed_database_internal(db_session, data_dir: str):
    from app.models import Scheme, SchemeVersion, EligibilityRule

    csv_path = os.path.join(data_dir, "scheme_catalogue.csv")
    if not os.path.exists(csv_path):
        logger.warning(f"Dataset CSV file not found at: {csv_path}")
        return

    inserted_count = 0
    updated_count = 0

    try:
        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

            for index, row in enumerate(rows, start=1):
                try:
                    scheme_code = (row.get("scheme_id") or f"SCHEME_{index:03d}").strip()
                    scheme_name = (row.get("scheme_name") or "Unnamed Scheme").strip()
                    category = (row.get("category") or "General Health").strip()
                    state_or_region = (row.get("jurisdiction") or "India").strip()
                    description = (row.get("brief_details") or "").strip()
                    eligibility_text = (row.get("eligibility") or "").strip()
                    official_url = (row.get("official_url") or "").strip()
                    source_url = (row.get("source_url") or "").strip()
                    verification_status = (row.get("verification_status") or "verified").strip()
                    last_verified_at = parse_date(row.get("last_verified"))

                    benefits = {
                        "where_to_apply": (row.get("where_to_apply") or "").strip(),
                        "required_documents_summary": (row.get("required_documents") or "").strip(),
                        "official_url": official_url,
                        "notes": (row.get("notes") or "").strip(),
                        "source_type": (row.get("source_type") or "government").strip()
                    }

                    existing_scheme = db_session.query(Scheme).filter(Scheme.scheme_code == scheme_code).first()

                    if existing_scheme:
                        existing_scheme.scheme_name = scheme_name
                        existing_scheme.category = category
                        existing_scheme.state_or_region = state_or_region
                        existing_scheme.description = description
                        existing_scheme.benefits = benefits
                        existing_scheme.source_url = official_url or source_url
                        existing_scheme.verification_status = verification_status
                        existing_scheme.last_verified_at = last_verified_at
                        existing_scheme.updated_at = datetime.utcnow()
                        scheme_obj = existing_scheme
                        updated_count += 1
                    else:
                        scheme_obj = Scheme(
                            scheme_code=scheme_code,
                            scheme_name=scheme_name,
                            category=category,
                            state_or_region=state_or_region,
                            description=description,
                            benefits=benefits,
                            status="active",
                            current_version=1,
                            source_url=official_url or source_url,
                            verification_status=verification_status,
                            last_verified_at=last_verified_at
                        )
                        db_session.add(scheme_obj)
                        db_session.flush()
                        inserted_count += 1

                    version_count = db_session.query(SchemeVersion).filter(SchemeVersion.scheme_id == scheme_obj.id).count()
                    if version_count == 0:
                        scheme_ver = SchemeVersion(
                            scheme_id=scheme_obj.id,
                            version=1,
                            eligibility_rules=[{"raw_rule": eligibility_text}],
                            benefits=benefits,
                            documents=[{"name": "Aadhaar Card", "mandatory": True}],
                            source_url=official_url or source_url,
                            verification_status=verification_status
                        )
                        db_session.add(scheme_ver)

                    rule_count = db_session.query(EligibilityRule).filter(EligibilityRule.scheme_id == scheme_obj.id).count()
                    if rule_count == 0:
                        rule = EligibilityRule(
                            scheme_id=scheme_obj.id,
                            field_name="general_eligibility",
                            operator="=",
                            expected_value="eligible",
                            description=eligibility_text or "General scheme eligibility criteria"
                        )
                        db_session.add(rule)

                except Exception as row_err:
                    logger.error(f"Error seeding scheme row {index}: {row_err}")
                    db_session.rollback()
                    continue

            db_session.commit()
            logger.info(f"Auto-seeding completed: {inserted_count} inserted, {updated_count} updated from scheme_catalogue.csv.")

    except Exception as e:
        logger.error(f"Auto-seeding process failed: {e}")
        db_session.rollback()

def auto_seed_if_empty():
    from app.core.database import SessionLocal
    from app.models import Scheme

    db = SessionLocal()
    try:
        count = db.query(Scheme).count()
        if count == 0:
            logger.info("Schemes table is empty. Auto-seeding initial 130 scheme catalogue...")
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(base_dir, "data")
            seed_database_internal(db, data_dir)
    except Exception as e:
        logger.warning(f"Auto-seed check failed: {e}")
    finally:
        db.close()
