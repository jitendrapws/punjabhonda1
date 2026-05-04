"""JWT + bcrypt admin authentication module.

Drop-in module that provides:
- password hashing/verification
- JWT access token create/decode
- admin seeding from ADMIN_EMAIL / ADMIN_PASSWORD
- FastAPI dependency `require_admin` that accepts EITHER Authorization: Bearer <jwt>
  OR legacy X-Admin-Token header (so existing tests / integrations keep working)
"""
import os
import bcrypt
import jwt
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Header, HTTPException, Request

JWT_ALGO = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 8  # 8 hours for admin sessions

logger = logging.getLogger(__name__)


def _jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET env var not configured")
    return secret


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGO)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGO])


async def seed_admin(db):
    """Create the admin user from env on first boot.
    Idempotent: if user exists with same password, do nothing; if different password, update hash."""
    email = (os.environ.get("ADMIN_EMAIL") or "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD") or ""
    if not email or not password:
        logger.warning("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed")
        return
    existing = await db.admin_users.find_one({"email": email})
    if not existing:
        await db.admin_users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": "Admin",
            "role": "owner",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {email}")
    else:
        # Update hash if env password changed
        if not verify_password(password, existing.get("password_hash", "")):
            await db.admin_users.update_one(
                {"email": email},
                {"$set": {"password_hash": hash_password(password)}},
            )
            logger.info(f"Updated admin password from env for: {email}")


async def authenticate(db, email: str, password: str) -> Optional[dict]:
    email = email.strip().lower()
    user = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    user.pop("password_hash", None)
    return user


def _extract_bearer(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


async def require_admin(
    request: Request,
    x_admin_token: Optional[str] = Header(default=None),
) -> dict:
    """FastAPI dependency. Accepts Authorization: Bearer <jwt> (preferred)
    or X-Admin-Token header (legacy fallback for existing callers/tests).
    Returns {id, email, name, role} on success; raises 401 otherwise."""

    # Preferred: JWT bearer token
    token = _extract_bearer(request)
    if token:
        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                raise HTTPException(status_code=401, detail="Invalid token type")
            return {"id": payload.get("sub"), "email": payload.get("email"), "name": "Admin", "role": "owner"}
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    # Legacy fallback: X-Admin-Token (for existing tests + backward compat)
    legacy = os.environ.get("ADMIN_TOKEN")
    if legacy and x_admin_token == legacy:
        return {"id": "legacy", "email": "legacy@admin", "name": "Legacy Token", "role": "owner"}

    raise HTTPException(status_code=401, detail="Unauthorized")
