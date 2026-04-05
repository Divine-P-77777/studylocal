import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Message {
    _id?: string;
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
    fileUrl?: string;
    messageType?: string;
    timestamp: Date;
    isRead?: boolean;
    readAt?: Date;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const useChat = (
    roomId: string,
    userId: string,
    userName: string,
    initialMessages: Message[],
    recipientId?: string
) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const hasSeeded = useRef<string | null>(null);

    useEffect(() => {
        if (hasSeeded.current !== roomId) {
            setMessages(initialMessages);
            hasSeeded.current = roomId;
        }
    }, [roomId, initialMessages]);

    const markAsRead = useCallback(() => {
        if (socketRef.current?.connected && roomId && userId) {
            socketRef.current.emit('mark-as-read', { roomId, userId });
        }
    }, [roomId, userId]);

    useEffect(() => {
        if (!roomId || !userId) return;

        const socket = io(BACKEND_URL, {
            path: "/socket.io",
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Chat Migration] Connected to FastAPI Socket.IO');
            setIsConnected(true);
            socket.emit('join-room', roomId);
            socket.emit('user-online', userId);
            socket.emit('mark-as-read', { roomId, userId });
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('receive-message', (data: Message) => {
            if (document.visibilityState === 'visible') {
                socket.emit('mark-as-read', { roomId, userId });
            }

            setMessages((prev) => {
                if (data.senderId === userId) {
                    // Replace the optimistic temp message with the real one from the server
                    const tempIdx = prev.findIndex(m => m._id?.startsWith('temp-') && m.message === data.message);
                    if (tempIdx !== -1) {
                        const next = [...prev];
                        next[tempIdx] = { ...data, timestamp: new Date(data.timestamp) };
                        return next;
                    }
                }

                // Deduplicate: don't add if we already have this message ID
                if (data._id && prev.some(m => m._id === data._id)) return prev;
                return [...prev, { ...data, timestamp: new Date(data.timestamp) }];
            });
            // NOTE: router.refresh() intentionally removed.
            // setMessages() above handles the real-time UI update instantly.
            // The sidebar/chat-list is refreshed separately via SSE in ChatListSync.tsx.
        });

        socket.on('messages-seen', (data: { roomId: string, readBy: string }) => {
            if (data.roomId === roomId && data.readBy !== userId) {
                setMessages((prev) => prev.map(m => 
                    m.senderId === userId ? { ...m, isRead: true, readAt: new Date() } : m
                ));
            }
        });

        // RE-ADDED: Handle message-deleted broadcast from FastAPI
        socket.on('message-deleted', (data: { roomId: string, messageId: string }) => {
            if (data.roomId === roomId) {
                setMessages((prev) => prev.filter(m => m._id !== data.messageId));
            }
        });

        const handleFocus = () => markAsRead();
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            socket.disconnect();
        };
    }, [roomId, userId, markAsRead]);

    const sendMessage = useCallback(
        async (msg: string, fileUrl?: string, messageType: string = "text") => {
            if ((!msg.trim() && !fileUrl) || !socketRef.current?.connected) return;

            const optimisticMsg: Message = {
                _id: `temp-${Date.now()}`,
                roomId,
                senderId: userId,
                senderName: userName,
                message: msg,
                fileUrl,
                messageType,
                timestamp: new Date(),
                isRead: false
            };

            setMessages((prev) => [...prev, optimisticMsg]);

            socketRef.current.emit('send-message', {
                roomId,
                senderId: userId,
                senderName: userName,
                message: msg,
                fileUrl,
                messageType,
                recipientId,
            });
        },
        [roomId, userId, userName, recipientId]
    );

    // RE-ADDED: Delete message emitter
    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (socketRef.current?.connected && roomId && messageId) {
                socketRef.current.emit('delete-message', { roomId, messageId });
            }
        },
        [roomId]
    );

    return {
        messages,
        sendMessage,
        deleteMessage,
        isConnected,
        markAsRead
    };
};
