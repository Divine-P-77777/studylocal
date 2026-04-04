import asyncio
import json
import logging
from typing import Dict, Set, Any
from collections import defaultdict

logger = logging.getLogger(__name__)

class NotificationManager:
    """
    Manages Server-Sent Events (SSE) connections for real-time notifications.
    Each user can have multiple active connections (tabs).
    """
    def __init__(self):
        # Maps user_id -> Set of asyncio.Queue
        self.connections: Dict[str, Set[asyncio.Queue]] = defaultdict(set)

    async def subscribe(self, user_id: str):
        """
        Register a new SSE connection for a user.
        """
        queue = asyncio.Queue()
        self.connections[user_id].add(queue)
        logger.info(f"[SSE] User {user_id} subscribed. Total connections for user: {len(self.connections[user_id])}")
        
        try:
            while True:
                # Wait for a new notification
                data = await queue.get()
                yield data
        except asyncio.CancelledError:
            logger.info(f"[SSE] User {user_id} connection cancelled.")
        finally:
            self.connections[user_id].remove(queue)
            if not self.connections[user_id]:
                del self.connections[user_id]
            logger.info(f"[SSE] User {user_id} unsubscribed. Remaining: {len(self.connections.get(user_id, []))}")

    async def notify_user(self, user_id: str, event_type: str, payload: Any):
        """
        Push a notification to all active connections for a specific user.
        """
        if user_id not in self.connections:
            return

        message = {
            "event": event_type,
            "data": payload
        }
        
        logger.info(f"[SSE] Notifying user {user_id} with event {event_type}")
        
        # Dispatch to all queues for this user
        for queue in self.connections[user_id]:
            await queue.put(message)

# Singleton instance
notification_manager = NotificationManager()
