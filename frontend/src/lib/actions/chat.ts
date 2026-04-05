'use server';

import { api } from '@/lib/api-client';

export async function getMessages(roomId: string) {
    if (!roomId) return [];

    try {
        // Call FastAPI instead of direct MongoDB
        // Use no-store to ensure Next.js fetch cache doesn't mask real-time updates
        const messages = await api.get(`/chat/history/${roomId}`, { cache: 'no-store' });
        console.log(`[Chat Migration] Fetched ${messages.length} messages from FastAPI for room: ${roomId}`);
        return messages;
    } catch (error) {
        console.error('[Chat Migration] Error fetching messages:', error);
        return [];
    }
}

// markAsRead is now handled via Socket.IO directly in the hook, 
// but we can add a REST fallback here if needed.
