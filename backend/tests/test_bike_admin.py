"""Admin CRUD tests for bikes resource: color_options + specifications."""
import os
import time
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


class TestBikeAdminCrud:
    created_slug = None

    def test_create_bike_with_colors_and_specs(self):
        slug = f"test-bike-{int(time.time())}"
        payload = {
            "slug": slug,
            "name": "TEST_Admin Bike",
            "category": "motorcycle",
            "price_from": 100000,
            "engine": "150 cc",
            "power": "15 bhp",
            "mileage": "50 kmpl",
            "description": "Test bike",
            "image": "https://example.com/test.jpg",
            "color_options": ["Red", "Blue", "Black"],
            "specifications": {"Displacement": "150 cc", "Transmission": "5-speed"},
        }
        r = requests.post(f"{API}/admin/bikes", headers=ADMIN_HEADERS, json=payload)
        assert r.status_code in (200, 201), r.text
        data = r.json()
        assert data["slug"] == slug
        assert data["color_options"] == ["Red", "Blue", "Black"]
        assert data["specifications"]["Displacement"] == "150 cc"
        assert "_id" not in data
        TestBikeAdminCrud.created_slug = slug

        # Verify GET
        g = requests.get(f"{API}/bikes/{slug}")
        assert g.status_code == 200
        gd = g.json()
        assert gd["color_options"] == ["Red", "Blue", "Black"]

    def test_update_bike_colors_and_specs(self):
        slug = TestBikeAdminCrud.created_slug
        assert slug is not None
        # Need id of bike
        lst = requests.get(f"{API}/admin/bikes", headers=ADMIN_HEADERS).json()
        bike = next((b for b in lst if b["slug"] == slug), None)
        assert bike is not None
        bike_id = bike["id"]

        patch = {"color_options": ["Green"], "specifications": {"X": "Y"}}
        r = requests.patch(f"{API}/admin/bikes/{bike_id}", headers=ADMIN_HEADERS, json=patch)
        assert r.status_code == 200, r.text

        g = requests.get(f"{API}/bikes/{slug}")
        assert g.status_code == 200
        gd = g.json()
        assert gd["color_options"] == ["Green"]
        assert gd["specifications"] == {"X": "Y"}

    def test_delete_bike(self):
        slug = TestBikeAdminCrud.created_slug
        lst = requests.get(f"{API}/admin/bikes", headers=ADMIN_HEADERS).json()
        bike = next((b for b in lst if b["slug"] == slug), None)
        assert bike is not None
        bike_id = bike["id"]
        r = requests.delete(f"{API}/admin/bikes/{bike_id}", headers=ADMIN_HEADERS)
        assert r.status_code in (200, 204)
        g = requests.get(f"{API}/bikes/{slug}")
        assert g.status_code == 404
