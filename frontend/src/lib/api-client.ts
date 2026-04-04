import { auth0 } from "@/lib/auth0";

// Helper to ensure base URL has no trailing slash to prevent double-slashes in endpoint calls
const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
const API_V1 = `${BASE_URL}/api/v1`;

async function getAuthHeaders() {
    // Only attempt to get session on the server
    if (typeof window !== "undefined") return { "Content-Type": "application/json" };
    
    try {
        // Ensure auth0 is available (only on server)
        if (!auth0) return { "Content-Type": "application/json" };
        
        const session = await auth0.getSession();
        if (!session?.user) return { "Content-Type": "application/json" };
        
        return {
            "X-User-Id": session.user.sub,
            "Content-Type": "application/json",
        };
    } catch (err) {
        // This might still trigger if called in a server component outside of a request hook
        console.warn("[API Client] Session not available in this context");
        return { "Content-Type": "application/json" };
    }
}

export const api = {
    async get(endpoint: string, options: RequestInit = {}) {
        const authHeaders = await getAuthHeaders();
        const mergedHeaders = new Headers(options.headers);
        Object.entries(authHeaders).forEach(([k, v]) => mergedHeaders.set(k, v));

        const response = await fetch(`${API_V1}${endpoint}`, {
            ...options,
            method: "GET",
            headers: mergedHeaders,
        });
        if (!response.ok) throw new Error(`API GET ${endpoint} failed: ${response.statusText}`);
        return response.json();
    },

    async post(endpoint: string, data?: any, options: RequestInit = {}) {
        const authHeaders = await getAuthHeaders();
        const mergedHeaders = new Headers(options.headers);
        Object.entries(authHeaders).forEach(([k, v]) => mergedHeaders.set(k, v));

        const response = await fetch(`${API_V1}${endpoint}`, {
            ...options,
            method: "POST",
            headers: mergedHeaders,
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API POST ${endpoint} failed: ${response.statusText}`);
        }
        return response.json();
    },

    async patch(endpoint: string, data?: any, options: RequestInit = {}) {
        const authHeaders = await getAuthHeaders();
        const mergedHeaders = new Headers(options.headers);
        Object.entries(authHeaders).forEach(([k, v]) => mergedHeaders.set(k, v));

        const response = await fetch(`${API_V1}${endpoint}`, {
            ...options,
            method: "PATCH",
            headers: mergedHeaders,
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API PATCH ${endpoint} failed: ${response.statusText}`);
        }
        return response.json();
    },

    async delete(endpoint: string, options: RequestInit = {}) {
        const authHeaders = await getAuthHeaders();
        const mergedHeaders = new Headers(options.headers);
        Object.entries(authHeaders).forEach(([k, v]) => mergedHeaders.set(k, v));

        const response = await fetch(`${API_V1}${endpoint}`, {
            ...options,
            method: "DELETE",
            headers: mergedHeaders,
        });
        if (!response.ok) throw new Error(`API DELETE ${endpoint} failed: ${response.statusText}`);
        return response.json();
    },
};
