'use server';

import { api } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';

export async function createEnrolment(tutorId: string, studentId: string, subject?: string) {
    try {
        const res = await api.post(`/enrolment/create?tutor_id=${tutorId}&student_id=${studentId}&subject=${subject || ""}`);
        revalidatePath('/dashboard');
        revalidatePath('/chat');
        return res;
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to create deal" };
    }
}

export async function confirmEnrolment(enrolmentId: string) {
    try {
        const res = await api.post(`/enrolment/confirm/${enrolmentId}`);
        revalidatePath('/dashboard');
        revalidatePath('/chat');
        return res;
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to confirm deal" };
    }
}

export async function cancelEnrolment(enrolmentId: string) {
    try {
        const res = await api.post(`/enrolment/cancel/${enrolmentId}`);
        revalidatePath('/dashboard');
        revalidatePath('/chat');
        return res;
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to cancel deal" };
    }
}

export async function getEnrolmentForChat(tutorId: string, studentId: string) {
    try {
        const res = await api.get(`/enrolment/status/${tutorId}/${studentId}`);
        return res.enrolment;
    } catch {
        return null;
    }
}

export async function getUserEnrolments() {
    try {
        return await api.get(`/enrolment/list`);
    } catch {
        return { asStudent: [], asTutor: [] };
    }
}
