"""Backend tests for Punjab Honda API.
Covers: bikes catalog, branches, enquiry creation (all types),
admin auth/verify, admin enquiries listing/filter, admin stats,
PATCH status update, and verifies _id leakage is prevented.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fallback: read from frontend .env
    try:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

# Load admin token from backend .env or environment (no hardcoded secret)
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')
if not ADMIN_TOKEN:
    try:
        with open('/app/backend/.env') as f:
            for line in f:
                if line.startswith('ADMIN_TOKEN='):
                    ADMIN_TOKEN = line.split('=', 1)[1].strip().strip('"')
                    break
    except Exception:
        pass
if not ADMIN_TOKEN:
    raise RuntimeError("ADMIN_TOKEN not configured. Set env var or /app/backend/.env entry.")

ADMIN_HEADERS = {"X-Admin-Token": ADMIN_TOKEN}


# ---------- Root ----------
class TestRoot:
    def test_root_ok(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert "Punjab Honda" in data.get("message", "")


# ---------- Bikes ----------
class TestBikes:
    def test_list_all_bikes_returns_21(self):
        r = requests.get(f"{API}/bikes")
        assert r.status_code == 200
        bikes = r.json()
        assert isinstance(bikes, list)
        assert len(bikes) == 21
        # validate structure
        b = bikes[0]
        for key in ("slug", "name", "category", "price_from", "engine", "power", "mileage", "description", "image"):
            assert key in b

    def test_filter_motorcycle(self):
        r = requests.get(f"{API}/bikes", params={"category": "motorcycle"})
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) == 9
        assert all(b["category"] == "motorcycle" for b in bikes)

    def test_filter_scooter(self):
        r = requests.get(f"{API}/bikes", params={"category": "scooter"})
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) == 4
        assert all(b["category"] == "scooter" for b in bikes)

    def test_filter_ev(self):
        r = requests.get(f"{API}/bikes", params={"category": "ev"})
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) == 2
        slugs = {b["slug"] for b in bikes}
        assert "activa-e" in slugs
        assert "qc1" in slugs

    def test_filter_bigwing(self):
        r = requests.get(f"{API}/bikes", params={"category": "bigwing"})
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) == 6
        assert all(b["category"] == "bigwing" for b in bikes)

    def test_get_bike_by_slug_activa125(self):
        r = requests.get(f"{API}/bikes/activa-125")
        assert r.status_code == 200
        b = r.json()
        assert b["slug"] == "activa-125"
        assert b["name"] == "Activa 125"
        assert b["category"] == "scooter"

    def test_get_bike_by_slug_shine125(self):
        r = requests.get(f"{API}/bikes/shine-125")
        assert r.status_code == 200
        b = r.json()
        assert b["slug"] == "shine-125"

    def test_get_bike_invalid_slug_404(self):
        r = requests.get(f"{API}/bikes/invalid-slug-xyz")
        assert r.status_code == 404


# ---------- Branches ----------
class TestBranches:
    def test_list_branches(self):
        r = requests.get(f"{API}/branches")
        assert r.status_code == 200
        branches = r.json()
        assert isinstance(branches, list)
        assert len(branches) >= 1
        for br in branches:
            assert "name" in br and "address" in br and "phone" in br


# ---------- Enquiries ----------
ENQUIRY_TYPES = [
    "product_enquiry", "test_ride", "quote", "service_booking",
    "insurance", "contact", "amc"
]


class TestEnquiries:
    created_ids = []

    @pytest.mark.parametrize("etype", ENQUIRY_TYPES)
    def test_create_enquiry_each_type(self, etype):
        payload = {
            "type": etype,
            "name": f"TEST_{etype}",
            "phone": "9999900000",
            "email": "test@example.com",
            "vehicle_slug": "activa-125",
            "vehicle_name": "Activa 125",
            "city": "Ahmedabad",
        }
        r = requests.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 200, f"Failed for {etype}: {r.text}"
        data = r.json()
        assert data["type"] == etype
        assert data["name"] == f"TEST_{etype}"
        assert data["phone"] == "9999900000"
        assert data["status"] == "new"
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "_id" not in data
        TestEnquiries.created_ids.append(data["id"])

    def test_create_enquiry_invalid_type(self):
        r = requests.post(f"{API}/enquiries", json={
            "type": "bogus_type", "name": "X", "phone": "1234567890"
        })
        assert r.status_code in (400, 422)

    def test_create_enquiry_missing_required(self):
        r = requests.post(f"{API}/enquiries", json={"type": "contact"})
        assert r.status_code in (400, 422)


# ---------- Admin Auth ----------
class TestAdminAuth:
    def test_verify_valid_token(self):
        r = requests.post(f"{API}/admin/verify", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_verify_invalid_token(self):
        r = requests.post(f"{API}/admin/verify", headers={"X-Admin-Token": "wrong"})
        assert r.status_code == 401

    def test_verify_missing_token(self):
        r = requests.post(f"{API}/admin/verify")
        assert r.status_code == 401


# ---------- Admin Enquiries ----------
class TestAdminEnquiries:
    def test_list_enquiries_requires_auth(self):
        r = requests.get(f"{API}/admin/enquiries")
        assert r.status_code == 401

    def test_list_enquiries_with_auth(self):
        r = requests.get(f"{API}/admin/enquiries", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list)
        # Should include enquiries created in earlier test class
        # Verify _id leakage is prevented
        for d in docs:
            assert "_id" not in d
            assert "id" in d
            assert "type" in d

    def test_filter_by_type_test_ride(self):
        r = requests.get(f"{API}/admin/enquiries", headers=ADMIN_HEADERS, params={"type": "test_ride"})
        assert r.status_code == 200
        docs = r.json()
        assert all(d["type"] == "test_ride" for d in docs)
        # Should have at least one because previous tests created one
        assert any(d.get("name") == "TEST_test_ride" for d in docs)

    def test_filter_by_status_new(self):
        r = requests.get(f"{API}/admin/enquiries", headers=ADMIN_HEADERS, params={"status": "new"})
        assert r.status_code == 200
        docs = r.json()
        assert all(d["status"] == "new" for d in docs)


# ---------- Admin Stats ----------
class TestAdminStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_returns_counters(self):
        r = requests.get(f"{API}/admin/stats", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        s = r.json()
        for k in ("total", "new", "today", "by_type"):
            assert k in s
        assert isinstance(s["total"], int)
        assert isinstance(s["new"], int)
        assert isinstance(s["today"], int)
        assert isinstance(s["by_type"], dict)
        for t in ENQUIRY_TYPES:
            assert t in s["by_type"]
            assert isinstance(s["by_type"][t], int)


# ---------- PATCH Status ----------
class TestPatchStatus:
    def _create(self, etype="contact"):
        r = requests.post(f"{API}/enquiries", json={
            "type": etype, "name": "TEST_patch", "phone": "9000000000"
        })
        assert r.status_code == 200
        return r.json()["id"]

    def test_patch_requires_auth(self):
        eid = self._create()
        r = requests.patch(f"{API}/admin/enquiries/{eid}", json={"status": "contacted"})
        assert r.status_code == 401

    def test_patch_status_to_contacted(self):
        eid = self._create()
        r = requests.patch(
            f"{API}/admin/enquiries/{eid}",
            headers=ADMIN_HEADERS,
            json={"status": "contacted"},
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # verify persistence via admin list
        r2 = requests.get(f"{API}/admin/enquiries", headers=ADMIN_HEADERS)
        assert r2.status_code == 200
        match = next((d for d in r2.json() if d["id"] == eid), None)
        assert match is not None
        assert match["status"] == "contacted"

    def test_patch_status_to_closed(self):
        eid = self._create()
        r = requests.patch(
            f"{API}/admin/enquiries/{eid}",
            headers=ADMIN_HEADERS,
            json={"status": "closed"},
        )
        assert r.status_code == 200

    def test_patch_invalid_status(self):
        eid = self._create()
        r = requests.patch(
            f"{API}/admin/enquiries/{eid}",
            headers=ADMIN_HEADERS,
            json={"status": "bogus"},
        )
        assert r.status_code in (400, 422)

    def test_patch_nonexistent_id(self):
        r = requests.patch(
            f"{API}/admin/enquiries/00000000-0000-0000-0000-000000000000",
            headers=ADMIN_HEADERS,
            json={"status": "closed"},
        )
        assert r.status_code == 404
