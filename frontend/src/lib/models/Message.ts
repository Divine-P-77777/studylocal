import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    roomId: string; // e.g., "tutorId_userId"
    senderId: string; // auth0Id of sender
    senderName: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    readAt?: Date;
}

const MessageSchema = new Schema<IMessage>({
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
});

// Compound index for room + timestamp for faster history lookup
MessageSchema.index({ roomId: 1, timestamp: 1 });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Message;
}

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema, 'Message');

export default Message;
