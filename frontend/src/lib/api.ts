const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export async function fetchApi<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
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
        throw new Error(error.message || 'API request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (null as unknown as T);
}
