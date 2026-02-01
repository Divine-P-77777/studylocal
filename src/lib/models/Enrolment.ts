import mongoose, { Schema, Document } from 'mongoose';

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

// Avoid duplicate enrolments for the same pair? 
// Maybe multiple active ones for different subjects? 
// For now, let's keep it flexible or add a unique index if desired.

export default mongoose.models.Enrolment || mongoose.model<IEnrolment>('Enrolment', EnrolmentSchema);
