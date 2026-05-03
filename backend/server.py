from fastapi import FastAPI, APIRouter, HTTPException, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Any, Dict
import uuid
from datetime import datetime, timezone
import cloudinary
import cloudinary.utils
import cloudinary.uploader

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True,
)

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'punjab-honda-admin-2026')

app = FastAPI(title="Punjab Honda API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------- Models ----------
EnquiryType = Literal[
    "product_enquiry", "test_ride", "quote", "service_booking",
    "insurance", "contact", "amc"
]

class EnquiryCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: EnquiryType
    name: str
    email: Optional[str] = None
    phone: str
    city: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    vehicle_slug: Optional[str] = None
    vehicle_name: Optional[str] = None
    color: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    branch: Optional[str] = None
    message: Optional[str] = None
    policy_number: Optional[str] = None
    registration_number: Optional[str] = None

class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["new", "contacted", "closed"] = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusUpdate(BaseModel):
    status: Literal["new", "contacted", "closed"]

class Bike(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    category: Literal["motorcycle", "scooter", "ev", "bigwing"]
    price_from: int
    engine: str = ""
    power: str = ""
    mileage: str = ""
    description: str = ""
    image: str = ""
    color_options: List[str] = Field(default_factory=list)
    specifications: Dict[str, str] = Field(default_factory=dict)
    sort_order: int = 0
    active: bool = True

class BikeUpsert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str
    name: str
    category: Literal["motorcycle", "scooter", "ev", "bigwing"]
    price_from: int
    engine: str = ""
    power: str = ""
    mileage: str = ""
    description: str = ""
    image: str = ""
    color_options: List[str] = Field(default_factory=list)
    specifications: Dict[str, str] = Field(default_factory=dict)
    sort_order: int = 0
    active: bool = True

class HeroSlide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tag: str = ""
    title: str = ""
    subtitle: str = ""
    cta: str = ""
    cta_link: str = "/bikes"
    image: str = ""
    accent: str = ""
    sort_order: int = 0
    active: bool = True

class Branch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str = ""
    phone: str = ""
    type: Literal["showroom", "service", "showroom_service"] = "showroom_service"
    sort_order: int = 0
    active: bool = True

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    text: str = ""
    rating: int = 5
    sort_order: int = 0
    active: bool = True

class ServiceItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    icon: str = "Wrench"
    cta_label: str = "Know More"
    cta_link: str = "/contact"
    sort_order: int = 0
    active: bool = True

# ---------- Initial Seed Data ----------
from seed_data import SEED_BIKES  # noqa: E402

SEED_BRANCHES = [
    {"name": "Punjab Honda - Ashram Road (HO)", "address": "Near Gujarat Vidyapith, Ashram Road, Ahmedabad, Gujarat - 380014", "phone": "9925115151", "type": "showroom_service"},
    {"name": "Punjab Honda - Maninagar", "address": "Near Railway Station, Maninagar, Ahmedabad, Gujarat - 380008", "phone": "9879788877", "type": "showroom_service"},
    {"name": "Punjab Honda - Bopal", "address": "SG Highway, Bopal, Ahmedabad, Gujarat - 380058", "phone": "9925115152", "type": "showroom"},
    {"name": "Punjab Honda - Naroda", "address": "Naroda GIDC, Ahmedabad, Gujarat - 382330", "phone": "9925115153", "type": "service"},
]

SEED_HERO_SLIDES = [
    {"tag": "Festive Offer", "title": "Ride into the Festive Season", "subtitle": "Exclusive offers on the all-new Activa 125 & Shine 125", "cta": "Explore Offers", "cta_link": "/bikes?category=scooter", "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&q=80", "accent": "SAVE UPTO ₹8,000"},
    {"tag": "Electric Future", "title": "Activa e: — Silent. Smart. Honda.", "subtitle": "Honda's first electric scooter with swappable batteries. Book now.", "cta": "Discover Activa e:", "cta_link": "/bikes/activa-e", "image": "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1600&q=80", "accent": "NEW LAUNCH"},
    {"tag": "Big Wing", "title": "Unleash the Super Bike in You", "subtitle": "CBR 650R, CB1000R, Gold Wing — Experience Honda's flagship machines", "cta": "Explore Big Wing", "cta_link": "/bikes?category=bigwing", "image": "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=1600&q=80", "accent": "PREMIUM LINE"},
]

SEED_TESTIMONIALS = [
    {"name": "Vansh Bhatt", "text": "Had a great experience at the service centre. The staff made the process very easy for me. Highly recommended for genuine Honda care in Ahmedabad.", "rating": 5},
    {"name": "Priya Shah", "text": "Bought my Activa 125 from Punjab Honda. Transparent pricing, quick delivery, and excellent after-sales. The team walked me through everything.", "rating": 5},
    {"name": "Rajesh Patel", "text": "Been servicing my Shine at Punjab Honda for 6 years. Never a single complaint. Genuine spares and honest mechanics.", "rating": 5},
]

SEED_SERVICES = [
    {"title": "Vehicle Service", "description": "Book your vehicle for free or paid service, 8 AM - 6 PM daily.", "icon": "Wrench", "cta_label": "Book Service", "cta_link": "/services"},
    {"title": "Accident Claim Insurance", "description": "End-to-end claim processing and repair of accidentally damaged vehicles.", "icon": "ShieldCheck", "cta_label": "Contact Branch", "cta_link": "/contact"},
    {"title": "Insurance Renewal", "description": "Renew two-wheeler insurance at any Punjab Honda branch.", "icon": "RefreshCw", "cta_label": "Renew Now", "cta_link": "/insurance"},
    {"title": "Accidents & Breakdown", "description": "Stuck anywhere in Ahmedabad? Call 9825007605 / 7600062148. T&C apply.", "icon": "Truck", "cta_label": "Call Now", "cta_link": "tel:9825007605"},
    {"title": "Annual Maintenance (AMC)", "description": "Sign an AMC and never worry about regular servicing again.", "icon": "Award", "cta_label": "Know More", "cta_link": "/services"},
    {"title": "SMS Service Reminder", "description": "Get SMS alerts for your next free service — never miss a slot.", "icon": "Bell", "cta_label": "Subscribe", "cta_link": "/contact"},
    {"title": "Drop Facility", "description": "Free drop facility up to 5 km from our service stations.", "icon": "Bike", "cta_label": "Ask at Booking", "cta_link": "/services"},
]

DEFAULT_SETTINGS = {
    "_id": "site",
    "brand_name": "Punjab Honda",
    "tagline": "Authorized HMSI Dealer",
    "sales_phone": "9925115151",
    "service_phone": "9879788877",
    "email": "customercare@punjabhonda.com",
    "address": "Ashram Road, Near Gujarat Vidyapith, Ahmedabad - 380014",
    "facebook": "",
    "instagram": "",
    "youtube": "",
    "insurance_banner_image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80",
    "insurance_banner_title": "Insurance Made Easy",
    "insurance_banner_subtitle": "Renew, claim, or buy new — Punjab Honda handles your two-wheeler insurance end-to-end.",
}


async def _seed_collection(name: str, items: List[dict]):
    """Seed a collection only if empty (idempotent)."""
    coll = db[name]
    count = await coll.count_documents({})
    if count > 0:
        return 0
    docs = []
    for i, item in enumerate(items):
        d = {**item}
        d.setdefault("id", str(uuid.uuid4()))
        d.setdefault("sort_order", i)
        d.setdefault("active", True)
        docs.append(d)
    if docs:
        await coll.insert_many(docs)
    return len(docs)


@app.on_event("startup")
async def seed_db():
    seeded = {}
    seeded["bikes"] = await _seed_collection("bikes", SEED_BIKES)
    seeded["branches"] = await _seed_collection("branches", SEED_BRANCHES)
    seeded["hero_slides"] = await _seed_collection("hero_slides", SEED_HERO_SLIDES)
    seeded["testimonials"] = await _seed_collection("testimonials", SEED_TESTIMONIALS)
    seeded["services"] = await _seed_collection("services", SEED_SERVICES)
    # site settings (single doc)
    if not await db.site_settings.find_one({"_id": "site"}):
        await db.site_settings.insert_one(DEFAULT_SETTINGS)
        seeded["site_settings"] = 1
    logger.info(f"Seed result: {seeded}")


def _check_admin(token: Optional[str]):
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _strip_id(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Punjab Honda API", "status": "ok"}


@api_router.get("/bikes")
async def list_bikes(category: Optional[str] = None):
    q = {"active": True}
    if category:
        q["category"] = category
    docs = await db.bikes.find(q, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return docs


@api_router.get("/bikes/{slug}")
async def get_bike(slug: str):
    bike = await db.bikes.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    return bike


@api_router.get("/branches")
async def list_branches():
    return await db.branches.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api_router.get("/hero-slides")
async def list_hero_slides():
    return await db.hero_slides.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api_router.get("/testimonials")
async def list_testimonials():
    return await db.testimonials.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api_router.get("/services")
async def list_services():
    return await db.services.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api_router.get("/site-settings")
async def get_site_settings():
    s = await db.site_settings.find_one({"_id": "site"})
    return _strip_id(s) if s else {}


@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(payload: EnquiryCreate):
    enquiry = Enquiry(**payload.model_dump())
    doc = enquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.enquiries.insert_one(doc)
    return enquiry


# ---------- Admin: Auth ----------
@api_router.post("/admin/verify")
async def verify_admin(x_admin_token: Optional[str] = Header(default=None)):
    _check_admin(x_admin_token)
    return {"ok": True}


# ---------- Admin: Cloudinary signature ----------
@api_router.get("/admin/cloudinary/signature")
async def cloudinary_signature(
    folder: str = Query("punjab-honda/uploads"),
    x_admin_token: Optional[str] = Header(default=None),
):
    _check_admin(x_admin_token)
    if not folder.startswith("punjab-honda/"):
        raise HTTPException(status_code=400, detail="Invalid folder")
    timestamp = int(time.time())
    params = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(params, os.environ['CLOUDINARY_API_SECRET'])
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ['CLOUDINARY_CLOUD_NAME'],
        "api_key": os.environ['CLOUDINARY_API_KEY'],
        "folder": folder,
    }


# ---------- Admin: Enquiries ----------
@api_router.get("/admin/enquiries")
async def list_enquiries(
    x_admin_token: Optional[str] = Header(default=None),
    type: Optional[str] = None,
    status: Optional[str] = None,
):
    _check_admin(x_admin_token)
    q = {}
    if type:
        q["type"] = type
    if status:
        q["status"] = status
    docs = await db.enquiries.find(q, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return docs


@api_router.get("/admin/stats")
async def admin_stats(x_admin_token: Optional[str] = Header(default=None)):
    _check_admin(x_admin_token)
    total = await db.enquiries.count_documents({})
    new = await db.enquiries.count_documents({"status": "new"})
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today = await db.enquiries.count_documents({"created_at": {"$gte": today_start}})
    by_type = {}
    for t in ["product_enquiry", "test_ride", "quote", "service_booking", "insurance", "contact", "amc"]:
        by_type[t] = await db.enquiries.count_documents({"type": t})
    return {"total": total, "new": new, "today": today, "by_type": by_type}


@api_router.patch("/admin/enquiries/{enquiry_id}")
async def update_enquiry_status(
    enquiry_id: str,
    body: StatusUpdate,
    x_admin_token: Optional[str] = Header(default=None),
):
    _check_admin(x_admin_token)
    result = await db.enquiries.update_one({"id": enquiry_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ---------- Admin: Generic CRUD factory ----------
def _make_crud(coll_name: str, model_cls):
    async def list_all(x_admin_token: Optional[str] = Header(default=None)):
        _check_admin(x_admin_token)
        return await db[coll_name].find({}, {"_id": 0}).sort("sort_order", 1).to_list(1000)

    async def create(payload: Dict[str, Any], x_admin_token: Optional[str] = Header(default=None)):
        _check_admin(x_admin_token)
        obj = model_cls(**payload)
        doc = obj.model_dump()
        await db[coll_name].insert_one(doc)
        return _strip_id(doc)

    async def update(item_id: str, payload: Dict[str, Any], x_admin_token: Optional[str] = Header(default=None)):
        _check_admin(x_admin_token)
        payload.pop("id", None)
        result = await db[coll_name].update_one({"id": item_id}, {"$set": payload})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        doc = await db[coll_name].find_one({"id": item_id}, {"_id": 0})
        return doc

    async def delete(item_id: str, x_admin_token: Optional[str] = Header(default=None)):
        _check_admin(x_admin_token)
        result = await db[coll_name].delete_one({"id": item_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}

    return list_all, create, update, delete


# Register CRUD endpoints
def _register_crud(prefix: str, coll: str, model_cls):
    list_all, create, update, delete = _make_crud(coll, model_cls)
    api_router.add_api_route(f"/admin/{prefix}", list_all, methods=["GET"], name=f"list_{coll}")
    api_router.add_api_route(f"/admin/{prefix}", create, methods=["POST"], name=f"create_{coll}")
    api_router.add_api_route(f"/admin/{prefix}/{{item_id}}", update, methods=["PATCH"], name=f"update_{coll}")
    api_router.add_api_route(f"/admin/{prefix}/{{item_id}}", delete, methods=["DELETE"], name=f"delete_{coll}")


_register_crud("bikes", "bikes", Bike)
_register_crud("hero-slides", "hero_slides", HeroSlide)
_register_crud("branches", "branches", Branch)
_register_crud("testimonials", "testimonials", Testimonial)
_register_crud("services", "services", ServiceItem)


# ---------- Admin: Site settings ----------
@api_router.patch("/admin/site-settings")
async def update_site_settings(
    payload: Dict[str, Any],
    x_admin_token: Optional[str] = Header(default=None),
):
    _check_admin(x_admin_token)
    payload.pop("_id", None)
    await db.site_settings.update_one({"_id": "site"}, {"$set": payload}, upsert=True)
    s = await db.site_settings.find_one({"_id": "site"})
    return _strip_id(s)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
