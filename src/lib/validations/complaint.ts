import { z } from 'zod';

export const ComplaintSchema = z.object({
    type: z.enum(['Tutor', 'Platform', 'Payment', 'Other']),
    description: z.string().min(10, 'Please describe the issue in at least 10 characters'),
    contact: z.string().min(5, 'Contact info required'),
    images: z.any().optional(), // File handling logic will be manual in generic FormData if needed
});

export type ComplaintInput = z.infer<typeof ComplaintSchema>;
