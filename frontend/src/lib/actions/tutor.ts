'use server';

import { api } from '@/lib/api-client';
import { TutorRegistrationSchema } from '@/lib/validations/tutor';
import { revalidatePath } from 'next/cache';

export async function registerTutor(prevState: any, formData: FormData) {
    try {
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
        
        // Use custom range if specified
        const finalClassRange = data.classRange === 'Degree/Other' && data.customRange 
            ? data.customRange 
            : data.classRange;

        // Call FastAPI Backend
        const payload = {
            fullName: data.fullName,
            photoUrl: data.photo,
            subjects: data.subjects.split(',').map(s => s.trim()).filter(Boolean),
            classRange: finalClassRange,
            tuitionMode: data.tuitionMode,
            monthlyFee: data.monthlyFee,
            area: data.area,
            experience: data.experience,
            bio: data.bio,
            contactInfo: {
                phone: data.phone,
                email: data.email,
            }
        };

        const res = await api.post('/tutor/register', payload);
        revalidatePath('/dashboard');
        return res;
    } catch (error: any) {
        console.error('[Tutor Migration] Registration Error:', error);
        return { success: false, message: error.message || 'Something went wrong.' };
    }
}

export async function updateTutor(tutorId: string, data: any) {
    try {
        // This handles status updates AND general profile edits
        const res = await api.patch(`/tutor/${tutorId}`, data);
        // Revalidate BOTH the admin view and the public /tutors listing page.
        // Without revalidating /tutors, an approved tutor will NOT appear publicly
        // until the 30s ISR window naturally expires.
        revalidatePath('/admin/tutor');
        revalidatePath('/tutors');
        return res;
    } catch (error: any) {
        console.error('[Tutor Migration] Update Error:', error);
        return { success: false, message: error.message || 'Something went wrong.' };
    }
}

export async function getTutors(filters: any = {}) {
    try {
        const query = new URLSearchParams();
        if (filters.status) query.append('status', filters.status);
        if (filters.subject) query.append('subject', filters.subject);
        if (filters.area) query.append('area', filters.area);
        
        const res = await api.get(`/tutor/?${query.toString()}`, { cache: 'no-store' });
        return res.tutors || [];
    } catch (error: any) {
        console.error('[Tutor Migration] Get Tutors Error:', error);
        return [];
    }
}

export async function sendTutorOTP() {
    try {
        const res = await api.post('/tutor/otp/send', {});
        return { 
            success: true, 
            message: res.message,
            remainingAttempts: res.remaining_attempts 
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
}

export async function verifyTutorOTP(code: string) {
    try {
        return await api.post('/tutor/otp/verify', { code });
    } catch (error: any) {
        return { success: false, message: error.message || 'OTP verification failed' };
    }
}

export async function getMyTutorProfile() {
    try {
        return await api.get('/tutor/me/profile', { cache: 'no-store' });
    } catch (error) {
        return null;
    }
}
