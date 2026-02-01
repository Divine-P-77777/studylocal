import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    auth0Id: string;
    email: string;
    role: 'student' | 'tutor';
    fullName: string;
    photoUrl?: string;
    isProfileComplete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        auth0Id: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true },
        role: {
            type: String,
            enum: ['student', 'tutor'],
            default: 'student',
            required: true
        },
        fullName: { type: String, required: true },
        photoUrl: { type: String },
        isProfileComplete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Prevent overwrite on HMR
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
