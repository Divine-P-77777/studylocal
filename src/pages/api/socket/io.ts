import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!(res.socket as any).server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = (res.socket as any).server;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });
        (res.socket as any).server.io = io;

        const onlineUsers = new Map<string, string>(); // userId -> socketId (simplified for singleton server)

        io.on('connection', (socket) => {
            console.log('Socket Connected', socket.id);

            socket.on('user-online', (userId) => {
                onlineUsers.set(userId, socket.id);
                io.emit('user-status', { userId, status: 'online' });
            });

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`User joined room: ${roomId}`);
            });

            socket.on('send-message', async (data) => {
                const { roomId, senderId, senderName, message } = data;

                try {
                    // Save to MongoDB
                    await dbConnect();
                    const newMessage = await Message.create({
                        roomId,
                        senderId,
                        senderName,
                        message
                    });

                    // Broadcast to room
                    io.to(roomId).emit('receive-message', newMessage);

                    // Notification Logic potentially here (if receiver not in room)
                    // But need to know receiverID from RoomID
                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });

            socket.on('delete-message', async (data) => {
                const { roomId, messageId } = data;
                try {
                    await dbConnect();
                    await Message.findByIdAndDelete(messageId);
                    // Broadcast deletion
                    io.to(roomId).emit('message-deleted', messageId);
                } catch (error) {
                    console.error('Error deleting message:', error);
                }
            });

            socket.on('disconnect', () => {
                // console.log('Socket disconnected');
                // Find user by socketId
                for (const [userId, socketId] of onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        onlineUsers.delete(userId);
                        io.emit('user-status', { userId, status: 'offline' });
                        break;
                    }
                }
            });
        });
    }
    res.end();
};

export default ioHandler;
