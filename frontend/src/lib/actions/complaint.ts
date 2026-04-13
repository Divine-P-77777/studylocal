'use server';

import { api } from '@/lib/api-client';

export async function submitSupportRequest(type: string, description: string) {
    try {
        const payload = {
            type, // feedback, issue, complaint
            description,
            reason: `Dashboard Support: ${type.toUpperCase()}`
        };
        
        const res = await api.post('/complaint/', payload);
        return res;
    } catch (error: any) {
        console.error('[Support Action] Submission Error:', error);
        return { success: false, message: error.message || 'Failed to submit request.' };
    }
}
