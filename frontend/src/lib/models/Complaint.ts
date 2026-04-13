import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IComplaint extends Document {
    reporterId: string;                                         // Auth0 user ID
    type: string;                                              // 'feedback' | 'issue' | 'complaint' | 'Tutor' | 'Platform' | 'Payment' | 'Other'
    description: string;
    reason?: string;
    status: string;                                            // 'pending' | 'open' | 'in progress' | 'resolved'
    contact?: string;                                           // Legacy field (kept for compatibility)
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
    {
        reporterId: { type: String, default: 'anonymous' },
        type: {
            type: String,
            // Enums expanded to prevent filtering legacy data while strictly allowing new categories
            enum: ['feedback', 'issue', 'complaint', 'Tutor', 'Platform', 'Payment', 'Other', 'other'],
            default: 'complaint'
        },
        description: { type: String, required: true, minlength: 10, maxlength: 2000 },
        reason: { type: String },
        status: {
            type: String,
            // Includes 'open' for backward compatibility with existing records
            enum: ['pending', 'open', 'in progress', 'resolved'],
            default: 'pending'
        },
        // Legacy field — kept so old records don't lose data
        contact: { type: String },
    },
    { timestamps: true }
);

// Robust Singleton Pattern for Next.js HMR
// 1. Check if model already exists to avoid OverwriteModelError
// 2. In development, we sometimes delete the model from the cache to ensure schema/collection changes are picked up
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Complaint;
}

const Complaint: Model<IComplaint> =
    mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema, 'Complaint');

export default Complaint;
