"""Backend tests for new CMS additions: hero-slides, testimonials, services,
site-settings, generic admin CRUD, Cloudinary signature."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
                break

API = f"{BASE_URL}/api"

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')
if not ADMIN_TOKEN:
    with open('/app/backend/.env') as f:
        for line in f:
            if line.startswith('ADMIN_TOKEN='):
                ADMIN_TOKEN = line.split('=', 1)[1].strip().strip('"')
                break

ADMIN_HEADERS = {"X-Admin-Token": ADMIN_TOKEN}


# ---------- Public CMS GETs ----------
class TestPublicCMS:
    def test_bikes_returns_23_no_id(self):
        r = requests.get(f"{API}/bikes")
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) == 23
        for b in bikes:
            assert "_id" not in b
            assert "slug" in b and "name" in b

    def test_hero_slides(self):
        r = requests.get(f"{API}/hero-slides")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        for d in data:
            assert "_id" not in d
            assert "title" in d

    def test_testimonials(self):
        r = requests.get(f"{API}/testimonials")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        for d in data:
            assert "_id" not in d
            assert "name" in d

    def test_services(self):
        r = requests.get(f"{API}/services")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 7
        for d in data:
            assert "_id" not in d
            assert "title" in d and "icon" in d

    def test_branches_min_4(self):
        r = requests.get(f"{API}/branches")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 4
        for d in data:
            assert "_id" not in d

    def test_site_settings(self):
        r = requests.get(f"{API}/site-settings")
        assert r.status_code == 200
        s = r.json()
        for k in ("brand_name", "sales_phone", "insurance_banner_image",
                  "insurance_banner_title", "insurance_banner_subtitle"):
            assert k in s, f"Missing {k}"
        assert "_id" not in s


# ---------- Cloudinary signature ----------
class TestCloudinarySignature:
    def test_signature_valid_token(self):
        r = requests.get(f"{API}/admin/cloudinary/signature", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        d = r.json()
        for k in ("signature", "timestamp", "cloud_name", "api_key", "folder"):
            assert k in d
        assert d["cloud_name"] == "dmtuyrkwy"
        assert d["folder"].startswith("punjab-honda/")
        assert isinstance(d["timestamp"], int)
        assert isinstance(d["signature"], str) and len(d["signature"]) > 10

    def test_signature_invalid_token(self):
        r = requests.get(
            f"{API}/admin/cloudinary/signature",
            headers={"X-Admin-Token": "wrong"},
        )
        assert r.status_code == 401

    def test_signature_missing_token(self):
        r = requests.get(f"{API}/admin/cloudinary/signature")
        assert r.status_code == 401

    def test_signature_evil_folder(self):
        r = requests.get(
            f"{API}/admin/cloudinary/signature",
            headers=ADMIN_HEADERS,
            params={"folder": "evil/path"},
        )
        assert r.status_code == 400

    def test_signature_custom_punjab_folder(self):
        r = requests.get(
            f"{API}/admin/cloudinary/signature",
            headers=ADMIN_HEADERS,
            params={"folder": "punjab-honda/bikes"},
        )
        assert r.status_code == 200
        assert r.json()["folder"] == "punjab-honda/bikes"


# ---------- Admin generic CRUD ----------
class TestAdminBikesCRUD:
    created_id = None

    def test_admin_list_bikes(self):
        r = requests.get(f"{API}/admin/bikes", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        bikes = r.json()
        assert len(bikes) >= 21

    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/bikes")
        assert r.status_code == 401

    def test_create_bike(self):
        payload = {
            "slug": "TEST_bike_crud", "name": "TEST CRUD Bike",
            "category": "motorcycle", "price_from": 100000,
            "engine": "100cc", "power": "10bhp", "mileage": "60kmpl",
            "description": "test", "image": "https://example.com/x.jpg",
            "sort_order": 999, "active": True,
        }
        r = requests.post(f"{API}/admin/bikes", headers=ADMIN_HEADERS, json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["slug"] == "TEST_bike_crud"
        assert d["name"] == "TEST CRUD Bike"
        assert "id" in d
        assert "_id" not in d
        TestAdminBikesCRUD.created_id = d["id"]

    def test_update_bike(self):
        assert TestAdminBikesCRUD.created_id
        r = requests.patch(
            f"{API}/admin/bikes/{TestAdminBikesCRUD.created_id}",
            headers=ADMIN_HEADERS,
            json={"name": "TEST CRUD Bike Updated", "price_from": 120000},
        )
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "TEST CRUD Bike Updated"
        assert d["price_from"] == 120000
        assert "_id" not in d

    def test_update_persists_via_get(self):
        r = requests.get(f"{API}/admin/bikes", headers=ADMIN_HEADERS)
        match = next((b for b in r.json() if b["id"] == TestAdminBikesCRUD.created_id), None)
        assert match is not None
        assert match["name"] == "TEST CRUD Bike Updated"

    def test_delete_bike(self):
        r = requests.delete(
            f"{API}/admin/bikes/{TestAdminBikesCRUD.created_id}",
            headers=ADMIN_HEADERS,
        )
        assert r.status_code == 200
        # verify gone
        r2 = requests.get(f"{API}/admin/bikes", headers=ADMIN_HEADERS)
        assert not any(b["id"] == TestAdminBikesCRUD.created_id for b in r2.json())

    def test_delete_nonexistent(self):
        r = requests.delete(
            f"{API}/admin/bikes/nonexistent-id-xyz",
            headers=ADMIN_HEADERS,
        )
        assert r.status_code == 404


@pytest.mark.parametrize("prefix,coll,payload", [
    ("hero-slides", "hero_slides", {"tag": "TEST", "title": "TEST_title", "subtitle": "x", "cta": "x", "cta_link": "/", "image": "https://example.com/x.jpg"}),
    ("branches", "branches", {"name": "TEST_branch", "address": "x", "phone": "1", "type": "showroom"}),
    ("testimonials", "testimonials", {"name": "TEST_test", "text": "great", "rating": 5}),
    ("services", "services", {"title": "TEST_service", "description": "x", "icon": "Wrench", "cta_label": "x", "cta_link": "/"}),
])
class TestOtherCRUD:
    def test_full_crud_cycle(self, prefix, coll, payload):
        # CREATE
        r = requests.post(f"{API}/admin/{prefix}", headers=ADMIN_HEADERS, json=payload)
        assert r.status_code == 200, f"{prefix} create failed: {r.text}"
        created = r.json()
        assert "id" in created
        assert "_id" not in created
        item_id = created["id"]

        # LIST + verify presence
        r = requests.get(f"{API}/admin/{prefix}", headers=ADMIN_HEADERS)
        assert r.status_code == 200
        items = r.json()
        assert any(i["id"] == item_id for i in items)
        for i in items:
            assert "_id" not in i

        # UPDATE - choose a field that exists in this resource
        update_field = "title" if "title" in payload else "name"
        r = requests.patch(
            f"{API}/admin/{prefix}/{item_id}",
            headers=ADMIN_HEADERS,
            json={update_field: "TEST_updated_value"},
        )
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated[update_field] == "TEST_updated_value"

        # DELETE
        r = requests.delete(f"{API}/admin/{prefix}/{item_id}", headers=ADMIN_HEADERS)
        assert r.status_code == 200

        # verify gone
        r = requests.get(f"{API}/admin/{prefix}", headers=ADMIN_HEADERS)
        assert not any(i["id"] == item_id for i in r.json())


# ---------- Site settings PATCH ----------
class TestSiteSettings:
    def test_patch_requires_auth(self):
        r = requests.patch(f"{API}/admin/site-settings", json={"brand_name": "X"})
        assert r.status_code == 401

    def test_patch_persists(self):
        # capture original
        orig = requests.get(f"{API}/site-settings").json()
        original_title = orig.get("insurance_banner_title", "Insurance Made Easy")

        # update
        new_title = "TEST_Updated Banner Title"
        r = requests.patch(
            f"{API}/admin/site-settings",
            headers=ADMIN_HEADERS,
            json={"insurance_banner_title": new_title},
        )
        assert r.status_code == 200
        d = r.json()
        assert d["insurance_banner_title"] == new_title
        assert "_id" not in d

        # verify via public GET
        r2 = requests.get(f"{API}/site-settings")
        assert r2.json()["insurance_banner_title"] == new_title

        # restore
        requests.patch(
            f"{API}/admin/site-settings",
            headers=ADMIN_HEADERS,
            json={"insurance_banner_title": original_title},
        )
