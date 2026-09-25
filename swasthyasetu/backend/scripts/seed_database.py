import os
import sys
import csv
import json
import logging
from datetime import datetime

# Add app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, init_db
from app.models import Scheme, SchemeVersion, EligibilityRule, SchemeDocument, SchemeChunk

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_database")

CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "health_scheme_rag_metadata_dataset.csv"))

def parse_date(date_str):
    if not date_str:
        return datetime.utcnow()
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.utcnow()

def seed_database():
    logger.info("Initializing Database schema...")
    init_db()

    if not os.path.exists(CSV_PATH):
        logger.error(f"Dataset CSV file not found at: {CSV_PATH}")
        sys.exit(1)

    db = SessionLocal()
    inserted_count = 0
    updated_count = 0
    skipped_count = 0
    error_count = 0

    try:
        with open(CSV_PATH, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            logger.info(f"Loaded {len(rows)} records from dataset.")

            for index, row in enumerate(rows, start=1):
                try:
                    scheme_code = (row.get("scheme_id") or f"SCHEME_{index:03d}").strip()
                    scheme_name = (row.get("scheme_name") or "Unnamed Scheme").strip()
                    category = (row.get("category") or "General Health").strip()
                    state_or_region = (row.get("state_or_region") or "All India").strip()
                    description = (row.get("scheme_description") or "").strip()
                    eligibility_text = (row.get("scheme_eligibility") or "").strip()
                    source_url = (row.get("source_url") or "").strip()
                    verification_status = (row.get("verification_status") or "verified").strip()
                    last_verified_at = parse_date(row.get("last_verified_at"))
                    version_num = 1
                    try:
                        version_num = int(row.get("version", 1))
                    except (ValueError, TypeError):
                        version_num = 1

                    keywords = (row.get("keywords") or "").strip()
                    search_aliases = (row.get("search_aliases") or "").strip()
                    intent_tags = (row.get("intent_tags") or "").strip()
                    notes = (row.get("notes") or "").strip()
                    searchable_text = (row.get("searchable_text") or "").strip()

                    benefits = {
                        "keywords": [k.strip() for k in keywords.split(";") if k.strip()],
                        "search_aliases": [a.strip() for a in search_aliases.split(";") if a.strip()],
                        "intent_tags": [t.strip() for t in intent_tags.split(";") if t.strip()],
                        "notes": notes,
                        "source_type": (row.get("source_type") or "government").strip()
                    }

                    # Check if scheme already exists (duplicate-safe check)
                    existing_scheme = db.query(Scheme).filter(Scheme.scheme_code == scheme_code).first()

                    if existing_scheme:
                        # Update existing record
                        existing_scheme.scheme_name = scheme_name
                        existing_scheme.category = category
                        existing_scheme.state_or_region = state_or_region
                        existing_scheme.description = description
                        existing_scheme.benefits = benefits
                        existing_scheme.source_url = source_url
                        existing_scheme.verification_status = verification_status
                        existing_scheme.last_verified_at = last_verified_at
                        existing_scheme.current_version = version_num
                        existing_scheme.updated_at = datetime.utcnow()
                        scheme_obj = existing_scheme
                        updated_count += 1
                    else:
                        # Create new scheme record
                        scheme_obj = Scheme(
                            scheme_code=scheme_code,
                            scheme_name=scheme_name,
                            category=category,
                            state_or_region=state_or_region,
                            description=description,
                            benefits=benefits,
                            status="active",
                            current_version=version_num,
                            source_url=source_url,
                            verification_status=verification_status,
                            last_verified_at=last_verified_at
                        )
                        db.add(scheme_obj)
                        db.flush() # Populate scheme_obj.id
                        inserted_count += 1

                    # Create or update SchemeVersion
                    existing_version = db.query(SchemeVersion).filter(
                        SchemeVersion.scheme_id == scheme_obj.id,
                        SchemeVersion.version == version_num
                    ).first()

                    if not existing_version:
                        scheme_ver = SchemeVersion(
                            scheme_id=scheme_obj.id,
                            version=version_num,
                            eligibility_rules=[{"raw_rule": eligibility_text}],
                            benefits=benefits,
                            documents=[{"name": "Aadhaar Card", "mandatory": True}, {"name": "Income Certificate", "mandatory": False}],
                            source_url=source_url,
                            verification_status=verification_status
                        )
                        db.add(scheme_ver)

                    # Create default EligibilityRule if not present
                    rule_count = db.query(EligibilityRule).filter(EligibilityRule.scheme_id == scheme_obj.id).count()
                    if rule_count == 0:
                        rule = EligibilityRule(
                            scheme_id=scheme_obj.id,
                            field_name="general_eligibility",
                            operator="=",
                            expected_value="eligible",
                            description=eligibility_text or "General scheme eligibility criteria"
                        )
                        db.add(rule)

                    # Create default SchemeDocument if not present
                    doc_count = db.query(SchemeDocument).filter(SchemeDocument.scheme_id == scheme_obj.id).count()
                    if doc_count == 0:
                        doc1 = SchemeDocument(
                            scheme_id=scheme_obj.id,
                            document_name="Aadhaar Card",
                            mandatory=True,
                            description="Identity and address proof"
                        )
                        doc2 = SchemeDocument(
                            scheme_id=scheme_obj.id,
                            document_name="Income / Category Certificate",
                            mandatory=False,
                            description="Proof of income or social category"
                        )
                        db.add(doc1)
                        db.add(doc2)

                    # Create SchemeChunk for RAG vector foundation
                    chunk_count = db.query(SchemeChunk).filter(SchemeChunk.scheme_id == scheme_obj.id).count()
                    if chunk_count == 0 and (searchable_text or description):
                        chunk = SchemeChunk(
                            scheme_id=scheme_obj.id,
                            chunk_text=searchable_text or f"{scheme_name}: {description}",
                            source_url=source_url,
                            verification_status=verification_status
                        )
                        db.add(chunk)

                except Exception as row_err:
                    logger.error(f"Error processing row {index} ({row.get('scheme_id')}): {row_err}")
                    error_count += 1
                    db.rollback()
                    continue

            db.commit()
            logger.info("=== SEED DATABASE SUMMARY ===")
            logger.info(f"Total Rows Processed: {len(rows)}")
            logger.info(f"Inserted: {inserted_count}")
            logger.info(f"Updated: {updated_count}")
            logger.info(f"Skipped/Errors: {error_count}")

    except Exception as e:
        logger.error(f"Seed process transaction failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
