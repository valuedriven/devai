// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('6. Endpoint GET /v1/auth/me', () => {

  test('6.1 Perfil do usuário autenticado', async ({ page, request }) => {
    // 1. Fazer requisição GET /api/v1/auth/me com cookie de sessão
    // Since we're using the frontend's server-side proxy or directly calling the backend, we can just use the page to make a fetch, or use playwright's request context which has the cookies.
    const cookies = await page.context().cookies();
    const token = cookies.find(c => c.name === 'devai_auth_token')?.value;

    expect(token).toBeDefined();

    const response = await request.get('http://localhost:3001/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Resultado esperado:
    // - Status 200
    expect(response.status()).toBe(200);

    // - Body contém: id, email, firstName, lastName, roles, imageUrl
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('roles');
  });

  test('6.2 Perfil sem autenticação', async ({ request }) => {
    // 1. Fazer requisição GET /api/v1/auth/me sem cookie
    const response = await request.get('http://localhost:3001/api/v1/auth/me');

    // Resultado esperado:
    // - Status 401
    expect(response.status()).toBe(401);
  });

});
