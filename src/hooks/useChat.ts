import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Message {
    _id?: string;
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp?: Date;
}

export const useChat = (roomId: string, userId: string, userName: string, initialMessages: Message[] = [], recipientId?: string) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const socketRef = useRef<Socket | null>(null);


    useEffect(() => {
        setMessages(initialMessages);
    }, [roomId, initialMessages]);

    useEffect(() => {
        if (!roomId || !userId) return;

        let isMounted = true;
        let socket: Socket | null = null;

        const initSocket = async () => {
            await fetch('/api/socket/io');

            if (!isMounted) return;

            socket = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
                transports: ['websocket', 'polling'], // Try websocket first
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Connected to chat server');
                if (socket) socket.emit('join-room', roomId);
            });

            socket.on('receive-message', (data: Message) => {
                setMessages((prev) => {
                    if (data.senderId === userId) {
                        // Find temp message to replace
                        const tempIdx = prev.findIndex(m =>
                            m.senderId === userId &&
                            (m._id?.startsWith('temp-') || !m._id) &&
                            m.message === data.message
                        );

                        if (tempIdx !== -1) {
                            const newArr = [...prev];
                            newArr[tempIdx] = data; // Replace with real one containing _id
                            return newArr;
                        }
                    }
                    return [...prev, data];
                });
            });

            socket.on('message-deleted', (messageId: string) => {
                setMessages((prev) => prev.filter(m => m._id !== messageId));
            });

            // If already connected by the time listeners are added
            if (socket && socket.connected) {
                socket.emit('join-room', roomId);
            }
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socket) {
                socket.disconnect();
            }
        };
    }, [roomId, userId]);

    const sendMessage = (msg: string) => {
        if (!socketRef.current || !msg.trim()) return;

        const payload: any = { // Relaxed type for new field
            roomId,
            senderId: userId,
            senderName: userName,
            message: msg,
            timestamp: new Date(),
            recipientId // Send this so server can notify
        };

        // Optimistic update
        setMessages((prev) => [...prev, { ...payload, _id: `temp-${Date.now()}` }]);

        socketRef.current.emit('send-message', payload);
    };

    const deleteMessage = (messageId: string) => {
        if (!socketRef.current) return;
        socketRef.current.emit('delete-message', { roomId, messageId });
        // Optimistic update
        setMessages((prev) => prev.filter(m => m._id !== messageId));
    };

    return { messages, sendMessage, deleteMessage, setMessages };
};
