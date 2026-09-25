import os
import json
import logging
from typing import Optional, Any
import redis
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("redis_cache")

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

_redis_client: Optional[redis.Redis] = None
_redis_checked: bool = False

def get_redis_client() -> Optional[redis.Redis]:
    """
    Returns an active Redis client connection or None if Redis is unavailable.
    Includes fast 0.2s socket connection timeout for instant fallback.
    """
    global _redis_client, _redis_checked
    if _redis_client is not None:
        try:
            _redis_client.ping()
            return _redis_client
        except Exception:
            _redis_client = None

    if _redis_checked and _redis_client is None:
        return None

    try:
        client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            password=REDIS_PASSWORD,
            socket_timeout=0.2,
            socket_connect_timeout=0.2,
            decode_responses=True
        )
        client.ping()
        _redis_client = client
        _redis_checked = True
        logger.info(f"Redis cache connected successfully on {REDIS_HOST}:{REDIS_PORT}")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis server unavailable ({REDIS_HOST}:{REDIS_PORT}). Operating in PostgreSQL fallback mode: {e}")
        _redis_client = None
        _redis_checked = True
        return None


def get_cache(key: str) -> Optional[Any]:
    """
    Retrieve JSON-deserialized object from Redis cache.
    Returns None on cache miss or Redis failure.
    """
    try:
        client = get_redis_client()
        if not client:
            return None
        cached_data = client.get(key)
        if cached_data:
            logger.info(f"[CACHE HIT] Key: '{key}'")
            return json.loads(cached_data)
        logger.info(f"[CACHE MISS] Key: '{key}'")
        return None
    except Exception as e:
        logger.warning(f"Redis GET failed for key '{key}'. Falling back to DB: {e}")
        return None


def set_cache(key: str, value: Any, ttl_seconds: int = 600) -> bool:
    """
    Serialize and store value in Redis cache with TTL.
    """
    try:
        client = get_redis_client()
        if not client:
            return False
        serialized = json.dumps(value, default=str)
        client.setex(name=key, time=ttl_seconds, value=serialized)
        logger.info(f"[CACHE SET] Key: '{key}' (TTL: {ttl_seconds}s)")
        return True
    except Exception as e:
        logger.warning(f"Redis SET failed for key '{key}': {e}")
        return False


def invalidate_cache(key: str) -> bool:
    """
    Invalidate specific key in Redis cache.
    """
    try:
        client = get_redis_client()
        if not client:
            return False
        client.delete(key)
        logger.info(f"[CACHE INVALIDATED] Key: '{key}'")
        return True
    except Exception as e:
        logger.warning(f"Redis DELETE failed for key '{key}': {e}")
        return False


def get_redis_status() -> dict:
    """
    Returns Redis status dict for system status check.
    """
    client = get_redis_client()
    if client:
        return {"status": "connected", "host": REDIS_HOST, "port": REDIS_PORT}
    return {"status": "fallback_offline", "host": REDIS_HOST, "port": REDIS_PORT}
