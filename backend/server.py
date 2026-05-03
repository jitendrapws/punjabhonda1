from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Punjab Honda API")
api_router = APIRouter(prefix="/api")

# Simple admin token (hardcoded for MVP admin gate - user can extend later)
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'punjab-honda-admin-2026')

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
    # insurance specific
    policy_number: Optional[str] = None
    registration_number: Optional[str] = None

class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["new", "contacted", "closed"] = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusUpdate(BaseModel):
    status: Literal["new", "contacted", "closed"]

# ---------- Bikes seed data ----------
BIKES = [
    # Motorcycles
    {"slug": "cb200x", "name": "CB200X", "category": "motorcycle", "price_from": 152000, "engine": "184.4 cc", "power": "17.03 bhp", "mileage": "42 kmpl", "description": "Adventure-ready styling with urban comfort. Built for the explorer in you.", "image": "https://images.unsplash.com/photo-1714238886076-bb9841c1c974?w=800&q=80"},
    {"slug": "hornet-2-0", "name": "Hornet 2.0", "category": "motorcycle", "price_from": 139800, "engine": "184.4 cc", "power": "17.03 bhp", "mileage": "45 kmpl", "description": "Premium streetfighter with aggressive design and thrilling performance.", "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80"},
    {"slug": "livo", "name": "Livo", "category": "motorcycle", "price_from": 81000, "engine": "109.51 cc", "power": "8.79 bhp", "mileage": "65 kmpl", "description": "Stylish commuter with class-leading mileage and comfort.", "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80"},
    {"slug": "cd-110-dream", "name": "CD 110 Dream", "category": "motorcycle", "price_from": 71900, "engine": "109.51 cc", "power": "8.67 bhp", "mileage": "74 kmpl", "description": "Honda's most dependable commuter. Mileage ka baadshah.", "image": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"},
    {"slug": "shine-125", "name": "Shine 125", "category": "motorcycle", "price_from": 81900, "engine": "123.94 cc", "power": "10.59 bhp", "mileage": "65 kmpl", "description": "India's No. 1 125cc motorcycle. Refined power. Smooth ride.", "image": "https://images.unsplash.com/photo-1558980394-dbb977039a2e?w=800&q=80"},
    {"slug": "unicorn", "name": "Unicorn", "category": "motorcycle", "price_from": 112000, "engine": "162.71 cc", "power": "12.91 bhp", "mileage": "60 kmpl", "description": "Smooth, powerful, reliable. The gentleman's motorcycle.", "image": "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=800&q=80"},
    {"slug": "sp-160", "name": "SP 160", "category": "motorcycle", "price_from": 120000, "engine": "162.71 cc", "power": "13.27 bhp", "mileage": "55 kmpl", "description": "Sporty performance meets everyday practicality.", "image": "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80"},
    {"slug": "sp-125", "name": "SP 125", "category": "motorcycle", "price_from": 86900, "engine": "123.94 cc", "power": "10.72 bhp", "mileage": "65 kmpl", "description": "India's first BS-VI motorcycle. Sporty, efficient, powerful.", "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80"},
    {"slug": "shine-100", "name": "Shine 100", "category": "motorcycle", "price_from": 64900, "engine": "98.98 cc", "power": "7.38 bhp", "mileage": "65 kmpl", "description": "The most affordable Honda motorcycle. Trust. Quality. Refinement.", "image": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80"},
    # Scooters
    {"slug": "dio", "name": "Dio", "category": "scooter", "price_from": 71500, "engine": "109.51 cc", "power": "7.65 bhp", "mileage": "55 kmpl", "description": "Youthful styling. Keep Dio'ing it.", "image": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"},
    {"slug": "dio-125", "name": "Dio 125", "category": "scooter", "price_from": 88000, "engine": "123.92 cc", "power": "8.16 bhp", "mileage": "48 kmpl", "description": "Bold. Sporty. Faster. The premium youth scooter.", "image": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"},
    {"slug": "activa-125", "name": "Activa 125", "category": "scooter", "price_from": 85000, "engine": "123.92 cc", "power": "8.18 bhp", "mileage": "47 kmpl", "description": "Premium family scooter with H-Smart keyless experience.", "image": "https://images.unsplash.com/photo-1568708890-b4a9de8c7a40?w=800&q=80"},
    {"slug": "activa-h-smart", "name": "Activa H-Smart", "category": "scooter", "price_from": 78000, "engine": "109.51 cc", "power": "7.75 bhp", "mileage": "55 kmpl", "description": "India's most trusted scooter. Now smarter with H-Smart key.", "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80"},
    # EV
    {"slug": "activa-e", "name": "Activa e:", "category": "ev", "price_from": 117000, "engine": "Electric (swappable battery)", "power": "6 kW", "mileage": "102 km/charge", "description": "Honda's first electric scooter for India. Zero emissions, pure Activa DNA.", "image": "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=800&q=80"},
    {"slug": "qc1", "name": "QC1", "category": "ev", "price_from": 90000, "engine": "Electric (fixed battery)", "power": "1.8 kW", "mileage": "80 km/charge", "description": "Compact, efficient, affordable. Perfect city companion.", "image": "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80"},
    # Big Wing (Super Bikes)
    {"slug": "cbr650r", "name": "CBR 650R", "category": "bigwing", "price_from": 999000, "engine": "648.72 cc", "power": "86 bhp", "mileage": "21 kmpl", "description": "Inline-four sportbike. Track DNA for the street.", "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80"},
    {"slug": "cb650r", "name": "CB650R", "category": "bigwing", "price_from": 950000, "engine": "648.72 cc", "power": "86 bhp", "mileage": "21 kmpl", "description": "Neo Sports Cafe. Bold, authentic, refined.", "image": "https://images.unsplash.com/photo-1558980394-dbb977039a2e?w=800&q=80"},
    {"slug": "cb1000r", "name": "CB1000R", "category": "bigwing", "price_from": 1450000, "engine": "998 cc", "power": "143 bhp", "mileage": "15 kmpl", "description": "Neo Sports Cafe flagship. Pure streetfighter aggression.", "image": "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=800&q=80"},
    {"slug": "fireblade", "name": "CBR1000RR-R Fireblade", "category": "bigwing", "price_from": 2880000, "engine": "999.9 cc", "power": "215 bhp", "mileage": "13 kmpl", "description": "MotoGP technology. Track-bred superbike.", "image": "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80"},
    {"slug": "africa-twin", "name": "Africa Twin", "category": "bigwing", "price_from": 1699000, "engine": "1084 cc", "power": "100 bhp", "mileage": "18 kmpl", "description": "True adventure tourer. Conquer any terrain.", "image": "https://images.unsplash.com/photo-1714238886076-bb9841c1c974?w=800&q=80"},
    {"slug": "gold-wing", "name": "Gold Wing", "category": "bigwing", "price_from": 3920000, "engine": "1833 cc", "power": "124 bhp", "mileage": "16 kmpl", "description": "The ultimate luxury tourer. Cross continents in comfort.", "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80"},
]

BRANCHES = [
    {"name": "Punjab Honda - Ashram Road (HO)", "address": "Near Gujarat Vidyapith, Ashram Road, Ahmedabad, Gujarat - 380014", "phone": "9925115151", "type": "showroom_service"},
    {"name": "Punjab Honda - Maninagar", "address": "Near Railway Station, Maninagar, Ahmedabad, Gujarat - 380008", "phone": "9879788877", "type": "showroom_service"},
    {"name": "Punjab Honda - Bopal", "address": "SG Highway, Bopal, Ahmedabad, Gujarat - 380058", "phone": "9925115152", "type": "showroom"},
    {"name": "Punjab Honda - Naroda", "address": "Naroda GIDC, Ahmedabad, Gujarat - 382330", "phone": "9925115153", "type": "service"},
]

# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Punjab Honda API", "status": "ok"}

@api_router.get("/bikes")
async def list_bikes(category: Optional[str] = None):
    if category:
        return [b for b in BIKES if b["category"] == category]
    return BIKES

@api_router.get("/bikes/{slug}")
async def get_bike(slug: str):
    bike = next((b for b in BIKES if b["slug"] == slug), None)
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    return bike

@api_router.get("/branches")
async def list_branches():
    return BRANCHES

@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(payload: EnquiryCreate):
    enquiry = Enquiry(**payload.model_dump())
    doc = enquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.enquiries.insert_one(doc)
    return enquiry

def _check_admin(token: Optional[str]):
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

@api_router.get("/admin/enquiries")
async def list_enquiries(
    x_admin_token: Optional[str] = Header(default=None),
    type: Optional[str] = None,
    status: Optional[str] = None,
):
    _check_admin(x_admin_token)
    q = {}
    if type: q["type"] = type
    if status: q["status"] = status
    docs = await db.enquiries.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
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

@api_router.post("/admin/verify")
async def verify_admin(x_admin_token: Optional[str] = Header(default=None)):
    _check_admin(x_admin_token)
    return {"ok": True}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
