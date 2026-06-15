import { Page } from '@playwright/test';

const API_URL = 'http://localhost:3001/api/v1';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiCall<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': DEFAULT_TENANT_ID,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/${path.replace(/^\//, '')}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${method} ${path} failed (${res.status}): ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) as T : null as T;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
  };
}

export async function registerUser(email: string, password: string): Promise<AuthResult> {
  return apiCall<AuthResult>('/auth/register', {
    method: 'POST',
    body: { email, password, firstName: 'Test', lastName: 'User' },
  });
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  return apiCall<AuthResult>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function generateUniqueEmail(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6);
  return `test-${ts}-${rand}@devai-test.com`;
}

export function generateTestPassword(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `Test${rand}A1!`;
}

export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

export async function setupAdminSession(page: Page, token: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate((t) => {
    localStorage.setItem('devai_auth_token', t);
    document.cookie = `devai_auth_token=${t}; path=/; max-age=86400; SameSite=Lax`;
  }, token);
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  active: boolean;
  image_url?: string;
}

export async function createTestProduct(token: string, data: ProductData) {
  const dto = {
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url || '',
    categoryId: String(data.category_id),
    stock: data.stock,
    active: data.active,
  };
  return apiCall('/products', {
    method: 'POST',
    token,
    body: dto,
  });
}

export async function createTestCategory(token: string, name: string) {
  return apiCall('/categories', {
    method: 'POST',
    token,
    body: { name },
  });
}

export async function getProducts() {
  return apiCall('/products');
}

export async function getActiveProducts() {
  return apiCall('/products/active');
}

interface AdminCredentials {
  email: string;
  password: string;
  token: string;
}

export async function getAdminCredentials(): Promise<AdminCredentials> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const auth = await loginUser(adminEmail, adminPassword);
    return { email: adminEmail, password: adminPassword, token: auth.token };
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    throw new Error(
      'Set ADMIN_EMAIL/ADMIN_PASSWORD env vars or CLERK_SECRET_KEY to auto-create admin user',
    );
  }

  const email = `admin-e2e-${Date.now()}@devai-test.com`;
  const password = `AdminE2E${Math.random().toString(36).substring(2, 10)}!`;

  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: 'E2E',
      last_name: 'Admin',
      public_metadata: { roles: ['admin'] },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create admin user in Clerk: ${res.status} ${errText}`);
  }

  const auth = await loginUser(email, password);
  return { email, password, token: auth.token };
}
