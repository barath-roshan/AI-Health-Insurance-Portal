import os
import sys
import unittest
from datetime import datetime

# Add app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, init_db
from app.models import Scheme, EligibilityRule
from app.services.eligibility.profile_validator import validate_and_normalize_profile
from app.services.eligibility.rule_evaluator import evaluate_single_rule
from app.services.eligibility.eligibility_engine import evaluate_scheme_eligibility, evaluate_all_schemes_for_profile

class TestDeterministicEligibilityEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.db = SessionLocal()

        # Create or fetch test scheme
        cls.test_scheme = cls.db.query(Scheme).filter(Scheme.scheme_code == "TEST_PMJAY_001").first()
        if not cls.test_scheme:
            cls.test_scheme = Scheme(
                scheme_code="TEST_PMJAY_001",
                scheme_name="Ayushman Bharat Test Scheme",
                category="central",
                state_or_region="Tamil Nadu",
                description="Test health scheme for low income citizens in Tamil Nadu",
                status="active"
            )
            cls.db.add(cls.test_scheme)
            cls.db.flush()

            # Rules
            r1 = EligibilityRule(
                scheme_id=cls.test_scheme.id,
                field_name="age",
                operator=">=",
                expected_value="18",
                description="Age must be 18 or above"
            )
            r2 = EligibilityRule(
                scheme_id=cls.test_scheme.id,
                field_name="annual_income",
                operator="<=",
                expected_value="150000",
                description="Annual family income must not exceed Rs. 150,000"
            )
            r3 = EligibilityRule(
                scheme_id=cls.test_scheme.id,
                field_name="occupation",
                operator="IN",
                expected_value='["farmer", "worker", "artisan"]',
                description="Occupation must be worker, farmer or artisan"
            )
            cls.db.add_all([r1, r2, r3])
            cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_1_fully_eligible(self):
        """Case 1: Fully eligible citizen profile"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "age": 35,
            "gender": "male",
            "occupation": "farmer",
            "annual_income": 120000,
            "family_size": 4
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "ELIGIBLE")
        self.assertEqual(len(res["failed_rules"]), 0)
        self.assertEqual(len(res["missing_fields"]), 0)

    def test_2_not_eligible(self):
        """Case 2: Hard failure — Income exceeds limit"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Madurai",
            "age": 40,
            "gender": "female",
            "occupation": "farmer",
            "annual_income": 400000,  # Exceeds 150000
            "family_size": 3
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "NOT_ELIGIBLE")
        self.assertTrue(len(res["failed_rules"]) > 0)

    def test_3_missing_income(self):
        """Case 3: Missing income field -> NEEDS_INFORMATION"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Salem",
            "age": 30,
            "gender": "male",
            "occupation": "farmer",
            "annual_income": None,  # Missing
            "family_size": 2
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "NEEDS_INFORMATION")
        self.assertIn("annual_income", res["missing_fields"])

    def test_4_missing_state(self):
        """Case 4: Missing state -> NEEDS_INFORMATION"""
        profile = {
            "state": None,  # Missing
            "district": "Coimbatore",
            "age": 25,
            "gender": "female",
            "occupation": "worker",
            "annual_income": 100000,
            "family_size": 3
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "NEEDS_INFORMATION")
        self.assertIn("state", res["missing_fields"])

    def test_5_boundary_income(self):
        """Case 5: Boundary income exactly on limit (150,000)"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Trichy",
            "age": 45,
            "gender": "male",
            "occupation": "artisan",
            "annual_income": 150000,  # Exact boundary
            "family_size": 5
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "ELIGIBLE")

    def test_6_multiple_schemes_evaluation(self):
        """Case 6: Evaluates profile against multiple database schemes"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "age": 72,
            "gender": "male",
            "occupation": "retired",
            "annual_income": 180000,
            "family_size": 2
        }
        results = evaluate_all_schemes_for_profile(self.db, profile)
        self.assertTrue(len(results) > 0)
        statuses = [r["status"] for r in results]
        self.assertTrue(any(s in ["ELIGIBLE", "NOT_ELIGIBLE", "NEEDS_INFORMATION", "NEAR_MATCH"] for s in statuses))

    def test_7_near_match(self):
        """Case 7: Income slightly above threshold (160,000 vs 150,000 limit = within 15%) -> NEAR_MATCH"""
        profile = {
            "state": "Tamil Nadu",
            "district": "Erode",
            "age": 30,
            "gender": "male",
            "occupation": "worker",
            "annual_income": 160000,  # 6.6% above limit
            "family_size": 4
        }
        res = evaluate_scheme_eligibility(self.test_scheme, profile)
        self.assertEqual(res["status"], "NEAR_MATCH")

    def test_8_invalid_profile(self):
        """Case 8: Invalid / empty profile"""
        profile = {}
        norm, missing, is_valid = validate_and_normalize_profile(profile)
        self.assertFalse(is_valid)
        self.assertTrue(len(missing) > 0)

if __name__ == "__main__":
    unittest.main()
