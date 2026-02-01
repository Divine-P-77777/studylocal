'use server';

import dbConnect from '@/lib/db/connect';
import Complaint from '@/lib/models/Complaint';
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
            return { success: false, message: 'Validation failed', errors: validated.error.flatten().fieldErrors };
        }

        // Handle Image (Optional basic logic for now, MVP)
        // For now we skip actual file upload logic for complaints to save complexity unless requested
        // or just leave it empty array

        await dbConnect();

        await Complaint.create({
            type: validated.data.type,
            description: validated.data.description,
            contact: validated.data.contact,
            status: 'open',
            images: [] // Placeholder
        });

        return { success: true, message: 'Complaint submitted. We will contact you soon.' };

    } catch (error: any) {
        return { success: false, message: 'Failed to submit complaint.' };
    }
}
