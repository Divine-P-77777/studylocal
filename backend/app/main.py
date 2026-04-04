import logging
import socketio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

from app.core.config import settings
from app.db.mongodb import mongo_client
from app.db.redis_client import redis_client
from app.api import chat as chat_router
from app.api import enrolment as enrolment_router
from app.api import user as user_router
from app.api import tutor as tutor_router
from app.api import complaint as complaint_router
from app.services.chat_service import chat_service

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Socket.IO Server Setup ───────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True,
    connection_timeout=60,
    ping_timeout=45,
    ping_interval=20
)
socket_app = socketio.ASGIApp(sio)

# ── Rate Limiter ───────────────────────────────────────────────────
# limiter is imported from app.core.limiter

# ── FastAPI Application Initialization ───────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ──────────────────────────────────────────────────────
app.include_router(chat_router.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(enrolment_router.router, prefix=f"{settings.API_V1_STR}/enrolment", tags=["enrolment"])
app.include_router(user_router.router, prefix=f"{settings.API_V1_STR}/user", tags=["user"])
app.include_router(tutor_router.router, prefix=f"{settings.API_V1_STR}/tutor", tags=["tutor"])
app.include_router(complaint_router.router, prefix=f"{settings.API_V1_STR}/complaint", tags=["complaint"])

# Mount Socket.IO to the FastAPI app
app.mount("/socket.io", socket_app)

# ── Lifecycle Events ────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("[Main] Starting up backend...")
    await mongo_client.connect()
    await redis_client.connect()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("[Main] Shutting down backend...")
    await mongo_client.close()
    await redis_client.close()

# ── Health Check ───────────────────────────────────────────────────
@app.get("/health")
@limiter.limit("5/minute")
async def health_check(request: Request):
    return {
        "status": "online",
        "mongodb": "connected" if mongo_client.db is not None else "disconnected",
        "upstash_redis": "connected" if redis_client.is_connected else "disconnected"
    }

# ── Socket.IO Event Handlers ──────────────────────────────────────────

@sio.event
async def connect(sid, environ):
    logger.info(f"[Socket.IO] New connection: {sid}")

@sio.on("join-room")
async def handle_join_room(sid, room_id):
    if not room_id: return
    await sio.enter_room(sid, room_id)
    logger.info(f"[Socket.IO] {sid} joined room: {room_id}")

@sio.on("user-online")
async def handle_user_online(sid, user_id):
    if not user_id: return
    await sio.save_session(sid, {"user_id": user_id})
    logger.info(f"[Socket.IO] {sid} mapped to user: {user_id}")
    await sio.emit("user-status", {"userId": user_id, "status": "online"}, skip_sid=sid)

@sio.on("send-message")
async def handle_send_message(sid, data):
    room_id = data.get("roomId")
    sender_id = data.get("senderId")
    sender_name = data.get("senderName")
    message = data.get("message")
    recipient_id = data.get("recipientId")
    file_url = data.get("fileUrl")
    message_type = data.get("messageType", "text")

    if not all([room_id, sender_id, message]):
        return

    # 1. Save to DB (Async ChatService)
    # Check if recipient is in the room
    participants = sio.manager.get_participants("/", room_id)
    is_read = False
    
    # Simple check: if someone else is in the room, mark as read
    if len(list(participants)) > 1:
        is_read = True

    from app.core.notifications import notification_manager
    
    new_msg = await chat_service.save_message(
        room_id, sender_id, sender_name, recipient_id or "", message, 
        file_url=file_url, message_type=message_type, 
        is_read=is_read
    )
    
    if new_msg:
        # 2. Broadcast to room via WebSocket
        await sio.emit("receive-message", new_msg, room=room_id)
        
        # 3. Trigger SSE Notification for recipient (Navbar/List)
        if recipient_id and not is_read:
            # Re-fetch count to be precise
            new_count = await chat_service.get_unread_count(recipient_id)
            await notification_manager.notify_user(recipient_id, "new-message", {
                "roomId": room_id,
                "senderName": sender_name,
                "preview": message[:60],
                "count": new_count
            })

@sio.on("mark-as-read")
async def handle_mark_as_read(sid, data):
    room_id = data.get("roomId")
    user_id = data.get("userId")
    if not room_id or not user_id: return
    
    from app.core.notifications import notification_manager
    success = await chat_service.mark_as_read(room_id, user_id)
    if success:
        await sio.emit("messages-seen", {"roomId": room_id, "readBy": user_id}, room=room_id)
        # Update Navbar/List count via SSE
        new_count = await chat_service.get_unread_count(user_id)
        await notification_manager.notify_user(user_id, "unread-count", {"count": new_count})

@sio.on("delete-message")
async def handle_delete_message(sid, data):
    room_id = data.get("roomId")
    message_id = data.get("messageId")
    if not room_id or not message_id: return
    
    # Needs user identity from session to ensure they own it
    session = await sio.get_session(sid)
    user_id = session.get("user_id") if session else None
    if not user_id: return
    
    success = await chat_service.delete_message(message_id, user_id, room_id)
    if success:
        # Broadcast the deletion to the room
        await sio.emit("message-deleted", {"roomId": room_id, "messageId": message_id}, room=room_id)

@sio.event
async def disconnect(sid):
    logger.info(f"[Socket.IO] Disconnected: {sid}")
