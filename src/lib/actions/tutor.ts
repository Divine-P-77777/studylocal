'use server';

import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import { TutorRegistrationSchema } from '@/lib/validations/tutor';
import { auth0 } from "@/lib/auth0";

export async function registerTutor(prevState: any, formData: FormData) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return { success: false, message: 'You must be logged in to register.' };
        }

        const rawData = {
            fullName: formData.get('fullName'),
            photo: formData.get('photo'),
            subjects: formData.get('subjects'),
            classRange: formData.get('classRange'),
            tuitionMode: formData.get('tuitionMode'),
            monthlyFee: formData.get('monthlyFee'),
            area: formData.get('area'),
            experience: formData.get('experience'),
            bio: formData.get('bio'),
            phone: formData.get('phone'),
            email: formData.get('email'),
        };

        const validatedFields = TutorRegistrationSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Validation failed',
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const data = validatedFields.data;

        await dbConnect();

        // Check if profile exists
        const existing = await TutorProfile.findOne({ auth0Id: session.user.sub });
        if (existing) {
            return { success: false, message: 'You have already registered as a tutor.' };
        }

        // Photo URL is now handled by frontend upload and passed as a string
        const photoUrl = data.photo;

        // Process subjects (comma separated string to array)
        const subjectsArray = data.subjects.split(',').map(s => s.trim()).filter(Boolean);

        // Create profile
        await TutorProfile.create({
            auth0Id: session.user.sub,
            fullName: data.fullName,
            photoUrl: photoUrl,
            subjects: subjectsArray,
            classRange: data.classRange,
            tuitionMode: data.tuitionMode,
            monthlyFee: data.monthlyFee,
            area: data.area,
            experience: data.experience,
            bio: data.bio,
            contactInfo: {
                phone: data.phone,
                email: data.email,
            },
            marketingStatus: 'pending',
        });

        return { success: true, message: 'Registration submitted successfully! Waiting for approval.' };
    } catch (error: any) {
        console.error('Registration Error:', error);
        return { success: false, message: error.message || 'Something went wrong.' };
    }
}

export async function updateTutorStatus(tutorId: string, status: 'pending' | 'approved' | 'rejected') {
    try {
        await dbConnect();
        const tutor = await TutorProfile.findByIdAndUpdate(tutorId, { marketingStatus: status }, { new: true });
        if (!tutor) {
            return { success: false, message: 'Tutor not found' };
        }
        return { success: true, message: `Status updated to ${status}` };
    } catch (error: any) {
        console.error('Update Status Error:', error);
        return { success: false, message: error.message || 'Something went wrong.' };
    }
}
