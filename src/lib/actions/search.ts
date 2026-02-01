'use server';

import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import { buildTutorQuery, TutorFilterParams } from '@/lib/utils/filter';

// Update interface for return type
export interface PaginatedTutors {
    tutors: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export async function getTutors(filters: TutorFilterParams, page: number = 1, limit: number = 10): Promise<PaginatedTutors> {
    try {
        await dbConnect();
        const query = buildTutorQuery(filters);
        const skip = (page - 1) * limit;

        const [tutors, total] = await Promise.all([
            TutorProfile.find(query)
                .select('fullName photoUrl subjects classRange area monthlyFee tuitionMode')
                .skip(skip)
                .limit(limit)
                .lean(),
            TutorProfile.countDocuments(query)
        ]);

        return {
            tutors: tutors.map((t: any) => ({ ...t, _id: t._id.toString() })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Failed to fetch tutors:', error);
        return {
            tutors: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        };
    }
}

export async function getTutorById(id: string) {
    try {
        await dbConnect();
        const tutor = await TutorProfile.findById(id).lean();
        if (!tutor) return null;
        return { ...tutor, _id: tutor._id.toString() };
    } catch (error) {
        return null;
    }
}

export async function getTutorByAuth0Id(auth0Id: string) {
    try {
        await dbConnect();
        const tutor = await TutorProfile.findOne({ auth0Id }).lean();
        if (!tutor) return null;
        return { ...tutor, _id: tutor._id.toString() };
    } catch (error) {
        return null;
    }
}
