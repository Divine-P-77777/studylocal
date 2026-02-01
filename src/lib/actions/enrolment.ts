'use server';

import dbConnect from '@/lib/db/connect';
import Enrolment from '@/lib/models/Enrolment';
import TutorProfile from '@/lib/models/TutorProfile';
import { auth0 } from '@/lib/auth0';
import { revalidatePath } from 'next/cache';

export async function createEnrolment(tutorId: string, studentId: string, subject?: string) {
    const session = await auth0.getSession();
    if (!session?.user) return { success: false, message: 'Unauthenticated' };

    await dbConnect();

    const myTutorProfile = await TutorProfile.findOne({ auth0Id: session.user.sub });
    if (!myTutorProfile || myTutorProfile._id.toString() !== tutorId) {
        return { success: false, message: 'Only tutors can initiate a deal.' };
    }

    // Check if already exists (active)
    const existing = await Enrolment.findOne({
        tutorId,
        studentId,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
        return { success: false, message: 'An active enrolment already exists.' };
    }

    const enrolment = await Enrolment.create({
        tutorId,
        studentId,
        subject,
        status: 'pending'
    });

    revalidatePath('/dashboard');
    revalidatePath('/chat');
    return { success: true, enrolment: JSON.parse(JSON.stringify(enrolment)) };
}

export async function confirmEnrolment(enrolmentId: string) {
    const session = await auth0.getSession();
    if (!session?.user) return { success: false, message: 'Unauthenticated' };

    await dbConnect();

    const enrolment = await Enrolment.findById(enrolmentId);
    if (!enrolment) return { success: false, message: 'Enrolment not found' };

    // Verify caller is the student
    if (enrolment.studentId !== session.user.sub) {
        return { success: false, message: 'Only the student can confirm the deal.' };
    }

    enrolment.status = 'confirmed';
    enrolment.confirmedAt = new Date();
    await enrolment.save();

    revalidatePath('/dashboard');
    revalidatePath('/chat');
    return { success: true, enrolment: JSON.parse(JSON.stringify(enrolment)) };
}

export async function cancelEnrolment(enrolmentId: string) {
    const session = await auth0.getSession();
    if (!session?.user) return { success: false, message: 'Unauthenticated' };

    await dbConnect();

    const enrolment = await Enrolment.findById(enrolmentId);
    if (!enrolment) return { success: false, message: 'Enrolment not found' };

    // Student or tutor can cancel, but typically student rejects a pending deal
    enrolment.status = 'cancelled';
    await enrolment.save();

    revalidatePath('/dashboard');
    revalidatePath('/chat');
    return { success: true, message: 'Deal cancelled successfully' };
}

export async function getEnrolmentForChat(tutorId: string, studentId: string) {
    await dbConnect();
    return await Enrolment.findOne({
        tutorId,
        studentId,
        status: { $in: ['pending', 'confirmed'] }
    }).lean();
}

export async function getUserEnrolments() {
    const session = await auth0.getSession();
    if (!session?.user) return { asStudent: [], asTutor: [] };

    await dbConnect();
    const userId = session.user.sub;

    // Fetch as student
    const asStudent = await Enrolment.find({ studentId: userId })
        .populate({ path: 'tutorId' })
        .sort({ createdAt: -1 })
        .lean();

    // Fetch as tutor
    const myTutorProfile = await TutorProfile.findOne({ auth0Id: userId });
    let asTutor: any[] = [];
    if (myTutorProfile) {
        asTutor = await Enrolment.find({ tutorId: myTutorProfile._id })
            .sort({ createdAt: -1 })
            .lean();
    }

    return {
        asStudent: JSON.parse(JSON.stringify(asStudent)),
        asTutor: JSON.parse(JSON.stringify(asTutor))
    };
}
