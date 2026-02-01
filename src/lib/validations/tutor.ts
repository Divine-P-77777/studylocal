import { z } from 'zod';

export const TutorRegistrationSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    photo: z.string().min(1, 'Profile photo is required'), // Base64 string
    subjects: z.string().min(2, 'Subjects must be at least 2 characters (comma separated)'), // We'll parse this
    classRange: z.string().min(1, 'Class range is required'),
    tuitionMode: z.enum(['Home', 'Tutor Home', 'Online']),
    monthlyFee: z.coerce.number().min(0, 'Fee must be a positive number'),
    area: z.string().min(2, 'Area is required'),
    experience: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
});

export type TutorRegistrationInput = z.infer<typeof TutorRegistrationSchema>;
