const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1');
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export async function fetchApi<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': DEFAULT_TENANT_ID,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API request failed: ${response.status}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : (null as unknown as T);
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
            // Em ambiente de build, não queremos que isso trave o processo,
            // mas queremos logs claros.
            console.warn(`[API] Warning: Could not connect to API at ${url}. ${isServer ? 'Build' : 'Client'} environment.`);
            throw error;
        }
        throw error;
    }
}
