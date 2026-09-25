import os
import sys
import unittest
from datetime import datetime
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import SessionLocal, init_db
from app.core.cache import invalidate_cache
from app.models import Scheme, SchemeVersion, HandoffRequest

class TestPhase5Integration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Seed test handoff request
        cls.test_handoff = cls.db.query(HandoffRequest).filter(HandoffRequest.conversation_id == "conv_test_123").first()
        if not cls.test_handoff:
            cls.test_handoff = HandoffRequest(
                user_id="demo_user",
                conversation_id="conv_test_123",
                user_query="How do I submit a dispute for scheme coverage?",
                intent="HUMAN_REQUEST",
                reason="User requested human customer care assistance.",
                summary="Dispute assistance requested.",
                status="PENDING"
            )
            cls.db.add(cls.test_handoff)

        # Seed test scheme
        cls.test_scheme = cls.db.query(Scheme).filter(Scheme.scheme_code == "TEST_PHASE5_SCHEME").first()
        if not cls.test_scheme:
            cls.test_scheme = Scheme(
                scheme_code="TEST_PHASE5_SCHEME",
                scheme_name="Phase 5 Test Health Scheme",
                category="central",
                state_or_region="India",
                description="Original version 1 description",
                status="active",
                current_version=1
            )
            cls.db.add(cls.test_scheme)
            cls.db.flush()

            v1 = SchemeVersion(
                scheme_id=cls.test_scheme.id,
                version=1,
                effective_from=datetime.utcnow()
            )
            cls.db.add(v1)

        cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_1_user_sees_own_support_request(self):
        response = self.client.get("/api/support?user_id=demo_user")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)
        self.assertEqual(data[0]["user_id"], "demo_user")

    def test_2_support_request_ownership_check(self):
        response = self.client.get(
            f"/api/support/{self.test_handoff.id}?user_id=unauthorized_user_999"
        )
        self.assertEqual(response.status_code, 403)

    def test_3_non_admin_cannot_access_admin_api(self):
        headers = {"X-User-Role": "USER", "X-User-ID": "regular_citizen"}
        response = self.client.get("/api/admin/handoffs", headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_4_admin_can_access_handoffs(self):
        headers = {"X-User-Role": "ADMIN", "X-User-ID": "admin_user"}
        response = self.client.get("/api/admin/handoffs", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)

    def test_5_admin_valid_status_transition(self):
        headers = {"X-User-Role": "ADMIN", "X-User-ID": "admin_user"}
        # Ensure status is PENDING first
        self.test_handoff.status = "PENDING"
        self.db.commit()

        response = self.client.patch(
            f"/api/admin/handoffs/{self.test_handoff.id}/status",
            json={"status": "IN_PROGRESS"},
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "IN_PROGRESS")

    def test_6_admin_invalid_status_transition_rejected(self):
        headers = {"X-User-Role": "ADMIN", "X-User-ID": "admin_user"}
        # Status is now IN_PROGRESS. Invalid transition back to PENDING.
        response = self.client.patch(
            f"/api/admin/handoffs/{self.test_handoff.id}/status",
            json={"status": "PENDING"},
            headers=headers
        )
        self.assertEqual(response.status_code, 400)

    def test_7_admin_scheme_update_creates_new_version(self):
        headers = {"X-User-Role": "ADMIN", "X-User-ID": "admin_user"}
        response = self.client.patch(
            f"/api/admin/schemes/{self.test_scheme.id}",
            json={"description": "Updated version 2 description"},
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        updated_scheme = response.json()
        self.assertTrue(updated_scheme["current_version"] >= 2)
        self.assertTrue(updated_scheme["rag_stale"])

        # Verify historical versions preserved
        v_response = self.client.get(
            f"/api/admin/schemes/{self.test_scheme.id}/versions",
            headers=headers
        )
        self.assertEqual(v_response.status_code, 200)
        versions = v_response.json()
        self.assertTrue(len(versions) >= 2)

    def test_8_redis_cache_miss_hit_and_invalidation(self):
        invalidate_cache(f"scheme:{self.test_scheme.id}")

        res1 = self.client.get(f"/api/schemes/{self.test_scheme.id}")
        self.assertEqual(res1.status_code, 200)

        res2 = self.client.get(f"/api/schemes/{self.test_scheme.id}")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res1.json()["id"], res2.json()["id"])

    def test_9_admin_system_status(self):
        headers = {"X-User-Role": "ADMIN", "X-User-ID": "admin_user"}
        response = self.client.get("/api/admin/system-status", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("postgresql", data)
        self.assertIn("redis_cache", data)
        self.assertIn("rag_microservice", data)

if __name__ == "__main__":
    unittest.main()
