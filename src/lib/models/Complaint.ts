import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaint extends Document {
    type: 'Tutor' | 'Platform' | 'Payment' | 'Other';
    description: string;
    contact: string; // Phone or Email
    status: 'open' | 'in progress' | 'resolved';
    images: string[];
    createdAt: Date;
}

const ComplaintSchema: Schema = new Schema(
    {
        type: {
            type: String,
            enum: ['Tutor', 'Platform', 'Payment', 'Other'],
            required: true
        },
        description: { type: String, required: true },
        contact: { type: String, required: true },
        status: {
            type: String,
            enum: ['open', 'in progress', 'resolved'],
            default: 'open'
        },
        images: { type: [String], default: [] },
    },
    { timestamps: true }
);

const Complaint: Model<IComplaint> =
    mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
