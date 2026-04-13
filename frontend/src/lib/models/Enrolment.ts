import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnrolment extends Document {
    tutorId: mongoose.Types.ObjectId;
    studentId: string; // Auth0 ID
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    agreedFee?: number;
    subject?: string;
    startDate?: Date;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EnrolmentSchema: Schema = new Schema({
    tutorId: { type: Schema.Types.ObjectId, ref: 'TutorProfile', required: true },
    studentId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    agreedFee: { type: Number },
    subject: { type: String },
    startDate: { type: Date },
    confirmedAt: { type: Date },
}, {
    timestamps: true
});

// Robust Singleton Pattern for Next.js HMR
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Enrolment;
}

const Enrolment: Model<IEnrolment> = 
    mongoose.models.Enrolment || mongoose.model<IEnrolment>('Enrolment', EnrolmentSchema, 'Enrolment');

export default Enrolment;
