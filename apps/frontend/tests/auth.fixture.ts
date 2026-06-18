import { test as base, Page, APIRequestContext } from '@playwright/test';
import { clerk } from '@clerk/testing/playwright';

const API_URL = 'http://localhost:3001/api/v1';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async get<T>(path: string, token?: string): Promise<T> {
    const headers: Record<string, string> = { 'X-Tenant-ID': DEFAULT_TENANT_ID };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await this.request.get(`${API_URL}/${path.replace(/^\//, '')}`, { headers });
    return await res.json() as T;
  }

  async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': DEFAULT_TENANT_ID,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await this.request.post(`${API_URL}/${path.replace(/^\//, '')}`, { headers, data: body });
    return await res.json() as T;
  }

  async patch<T>(path: string, body?: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': DEFAULT_TENANT_ID,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await this.request.patch(`${API_URL}/${path.replace(/^\//, '')}`, { headers, data: body });
    return await res.json() as T;
  }

  async del(path: string, token?: string): Promise<number> {
    const headers: Record<string, string> = { 'X-Tenant-ID': DEFAULT_TENANT_ID };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await this.request.delete(`${API_URL}/${path.replace(/^\//, '')}`, { headers });
    return res.status();
  }

  async register(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
    return this.post('/auth/register', { email, password, firstName: 'Test', lastName: 'User' });
  }

  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
    return this.post('/auth/login', { email, password });
  }

  async getAdminCredentials(): Promise<{ email: string; password: string; token: string }> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const auth = await this.login(adminEmail, adminPassword);
      return { email: adminEmail, password: adminPassword, token: auth.token };
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new Error(
        'Set ADMIN_EMAIL/ADMIN_PASSWORD env vars or CLERK_SECRET_KEY to auto-create admin user',
      );
    }

    const email = `admin-e2e-${Date.now()}@devai-test.com`;
    const password = `Admin${Math.random().toString(36).substring(2, 8)}1!`;

    const res = await this.request.post('https://api.clerk.com/v1/users', {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        email_address: [email],
        password,
        first_name: 'E2E',
        last_name: 'Admin',
        public_metadata: { roles: ['admin'] },
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to create admin user in Clerk: ${res.status} ${errText}`);
    }

    const auth = await this.login(email, password);
    return { email, password, token: auth.token };
  }

  async createCategory(token: string, name: string) {
    return this.post('/categories', { name }, token);
  }

  async createProduct(token: string, data: {
    name: string; description: string; price: number; stock: number; category_id: string; active: boolean; image_url?: string;
  }) {
    return this.post('/products', {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.image_url || '',
      categoryId: Number(data.category_id),
      stock: data.stock,
      active: data.active,
    }, token);
  }
}

type AuthFixtures = {
  loginAs: (email: string) => Promise<Page>;
  api: ApiHelper;
};

export const test = base.extend<AuthFixtures>({
  loginAs: async ({ page }, use) => {
    const loginFn = async (email: string) => {
      await page.goto('/');
      await clerk.signIn({
        page,
        emailAddress: email,
      });
      return page;
    };
    await use(loginFn);
  },
  api: async ({ request }, use) => {
    await use(new ApiHelper(request));
  },
});

export { expect } from '@playwright/test';
