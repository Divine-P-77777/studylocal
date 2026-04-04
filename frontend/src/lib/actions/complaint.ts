'use server';

import { api } from '@/lib/api-client';
import { ComplaintSchema } from '@/lib/validations/complaint';

export async function submitComplaint(prevState: any, formData: FormData) {
    try {
        const rawData = {
            type: formData.get('type') as any,
            description: formData.get('description'),
            contact: formData.get('contact'),
        };

        // Validate
        const validated = ComplaintSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                message: 'Validation failed',
                errors: validated.error.flatten().fieldErrors,
            };
        }

        // Call FastAPI Backend
        const payload = {
            reason: validated.data.type,
            description: validated.data.description,
            contactInfo: validated.data.contact,
            status: 'open',
        };

        const res = await api.post('/complaint/', payload);
        return res;

    } catch (error: any) {
        console.error('[Complaint Migration] Failed to submit complaint:', error);
        return { success: false, message: 'Failed to submit complaint.' };
    }
}
