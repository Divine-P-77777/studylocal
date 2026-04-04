'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@/hooks/useAuth0';

export default function ChatListSync() {
    const { user } = useAuth0();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        // Use the same SSE stream to trigger list refreshes
        const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
        const eventSource = new EventSource(`${BACKEND_URL}/api/v1/chat/stream?x_user_id=${user.sub}`);

        eventSource.addEventListener('new-message', () => {
            console.log('[ChatList] New message detected via SSE. Refreshing list...');
            router.refresh(); // Triggers a re-fetch of the server component data
        });

        eventSource.addEventListener('unread-count', () => {
            console.log('[ChatList] Unread count changed. Refreshing list...');
            router.refresh();
        });

        eventSource.onerror = () => {
            console.warn('[ChatList] SSE Connection lost. Retrying...');
        };

        return () => {
            eventSource.close();
        };
    }, [user, router]);

    return null; // This component has no UI, just side effects
}
