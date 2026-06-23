import { fetchApi, setOnUnauthorized } from "@/lib/api";

export { setOnUnauthorized };

export interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  token?: string;
}

export async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const init: RequestInit = {
    method,
    headers: config?.headers,
    signal: config?.signal,
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return fetchApi<T>(path, init, config?.token);
}

export const api = {
  get<T>(path: string, config?: RequestConfig): Promise<T> {
    return request<T>("GET", path, undefined, config);
  },

  post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>("POST", path, body, config);
  },

  put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>("PUT", path, body, config);
  },

  patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>("PATCH", path, body, config);
  },

  delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return request<T>("DELETE", path, undefined, config);
  },
};
