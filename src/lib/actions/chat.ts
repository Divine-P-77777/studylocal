'use server';

import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';

export async function getMessages(roomId: string) {
    try {
        await dbConnect();
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 }).lean();

        return messages.map((msg: any) => ({
            _id: msg._id.toString(),
            roomId: msg.roomId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            message: msg.message,
            timestamp: msg.timestamp,
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}
