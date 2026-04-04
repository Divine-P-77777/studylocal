'use server';

import { auth0 } from '@/lib/auth0';
import { api } from '@/lib/api-client';

export async function getUser(auth0Id: string) {
    if (!auth0Id) return null;
    try {
        return await api.get(`/user/${auth0Id}`);
    } catch {
        return null;
    }
}

export async function syncUser(userData: any) {
    try {
        return await api.post(`/user/sync`, userData);
    } catch (err) {
        console.error('[User Sync] Failed to sync user data:', err);
        return { success: false };
    }
}

export async function updateUser(auth0Id: string, data: any) {
    try {
        return await api.patch(`/user/${auth0Id}`, data);
    } catch (err) {
        console.error('[User Update] Failed to update user profile:', err);
        throw err;
    }
}

export async function getCurrentUser() {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return getUser(session.user.sub);
}
