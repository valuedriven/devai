const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function fetchApi<T>(
    path: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': DEFAULT_TENANT_ID,
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: isServer ? undefined : 'include',
        });

        if (!response.ok) {
            if (response.status === 401 && onUnauthorized && !path.includes('/auth/login') && !path.includes('/auth/register')) {
                onUnauthorized();
            }
            const error = await response.json().catch(() => ({}));
            const message = error.detail || error.title || error.message || response.statusText;
            const err = new Error(message);
            Object.assign(err, { status: response.status });
            throw err;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : (null as unknown as T);
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
            console.warn(`[API] Warning: Could not connect to API at ${url}. ${isServer ? 'Build' : 'Client'} environment.`);
        }
        throw error;
    }
}
