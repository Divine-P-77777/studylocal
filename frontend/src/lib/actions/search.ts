'use server';

import { api } from '@/lib/api-client';

export interface PaginatedTutors {
    tutors: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ── Paginated list ─────────────────────
export async function getTutors(
    filters: any,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedTutors> {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.subject && { subject: filters.subject }),
            ...(filters.classRange && { classRange: filters.classRange }),
            ...(filters.area && { area: filters.area }),
        });

        // Call FastAPI instead of direct MongoDB
        return await api.get(`/tutor?${queryParams.toString()}`);
    } catch (error) {
        console.error('[Search Migration] Failed to fetch tutors:', error);
        return {
            tutors: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
}

// ── Single tutor by MongoDB _id ───────────────────────────────────────────────
export async function getTutorById(id: string) {
    if (!id) return null;
    try {
        return await api.get(`/tutor/${id}`);
    } catch {
        return null;
    }
}

// ── Single tutor by Auth0 ID ──────────────────────────────────────────────────
export async function getTutorByAuth0Id(auth0Id: string) {
    if (!auth0Id) return null;
    try {
        return await api.get(`/user/tutor/${auth0Id}`);
    } catch {
        return null;
    }
}
