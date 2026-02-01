import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITutorProfile extends Document {
    auth0Id: string;
    fullName: string;
    photoUrl?: string;
    subjects: string[];
    classRange: string; // e.g., "Class 1-5", "Class 6-8"
    tuitionMode: 'Home' | 'Tutor Home' | 'Online';
    marketingStatus: 'pending' | 'approved' | 'rejected';
    monthlyFee: number;
    area: string;
    experience?: string;
    bio?: string;
    contactInfo?: {
        phone?: string;
        email?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TutorProfileSchema: Schema = new Schema(
    {
        auth0Id: { type: String, required: true, unique: true, index: true },
        fullName: { type: String, required: true },
        photoUrl: { type: String },
        subjects: { type: [String], default: [] },
        classRange: { type: String, required: true },
        tuitionMode: {
            type: String,
            enum: ['Home', 'Tutor Home', 'Online'],
            required: true
        },
        marketingStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true
        },
        monthlyFee: { type: Number, required: true },
        area: { type: String, required: true, index: true },
        experience: { type: String },
        bio: { type: String, maxlength: 500 },
        contactInfo: {
            phone: String,
            email: String,
        },
    },
    { timestamps: true }
);

// Prevent overwrite on HMR
const TutorProfile: Model<ITutorProfile> =
    mongoose.models.TutorProfile || mongoose.model<ITutorProfile>('TutorProfile', TutorProfileSchema);

export default TutorProfile;
