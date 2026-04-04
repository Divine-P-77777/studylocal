from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header, Request, Query
from app.core.limiter import limiter
from app.services.chat_service import chat_service

from fastapi.responses import StreamingResponse
import asyncio
import json
from app.core.notifications import notification_manager

router = APIRouter()

@router.get("/stream")
async def chat_notification_stream(
    request: Request, 
    x_user_id: Optional[str] = Header(None), 
    user_id_query: Optional[str] = Query(None, alias="x_user_id")
):
    """
    Server-Sent Events (SSE) stream for real-time notifications.
    Supports both Header (Internal Proxy) and Query Param (Browser EventSource).
    """
    effective_user_id = x_user_id or user_id_query
    
    if not effective_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    async def event_generator():
        # 1. Yield initial unread count
        count = await chat_service.get_unread_count(effective_user_id)
        yield {
            "event": "initial-count",
            "data": json.dumps({"count": count})
        }

        # 2. Subscribe to NotificationManager
        async for message in notification_manager.subscribe(x_user_id):
            # Check if client disconnected
            if await request.is_disconnected():
                break
            
            # Yield as SSE format
            yield {
                "event": message["event"],
                "data": json.dumps(message["data"])
            }

    async def sse_formatter():
        async for event in event_generator():
            yield f"event: {event['event']}\ndata: {event['data']}\n\n"
            # Optional: Heartbeat to keep connection alive
            await asyncio.sleep(0.1)

    return StreamingResponse(sse_formatter(), media_type="text/event-stream")

@router.get("/history/{room_id}", response_model=List[dict])
@limiter.limit("40/minute")
async def get_chat_history(request: Request, room_id: str, x_user_id: str = Header(None)):
    """
    Retrieve chat history for a specific room.
    Authentication is currently handled via the X-User-Id header (Internal Proxy Pattern).
    """
    if not room_id:
        raise HTTPException(status_code=400, detail="Room ID is required")
    
    messages = await chat_service.get_messages(room_id)
    return messages

@router.post("/read/{room_id}")
@limiter.limit("20/minute")
async def mark_room_as_read(request: Request, room_id: str, x_user_id: str = Header(...)):
    """
    Mark all unread messages in a room where the current user is the recipient as read.
    """
    success = await chat_service.mark_as_read(room_id, x_user_id)
    return {"success": success}

@router.get("/unread-count")
@limiter.limit("30/minute")
async def get_unread_count(request: Request, x_user_id: str = Header(None)):
    """
    Get the unread message count for the current user.
    """
    if not x_user_id:
        return {"count": 0}
    
    count = await chat_service.get_unread_count(x_user_id)
    return {"count": count}
