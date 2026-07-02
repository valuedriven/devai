// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';
import { API_BASE } from './utils/api';

test.describe('8. Endpoints Públicos', () => {

  test('8.1 Acesso público a catálogo', async ({ request }) => {
    // Estado inicial: Não autenticado

    // 1. Fazer requisição GET /api/v1/products
    const response = await request.get(`${API_BASE}/products`);

    // Resultado esperado:
    // - Status 200
    expect(response.status()).toBe(200);

    // - Lista de produtos retornada
    const data = await response.json();
    expect(Array.isArray(data) || Array.isArray(data.items) || Array.isArray(data.data)).toBeTruthy();
  });

  test('8.2 Acesso público com token válido', async ({ page, request }) => {
    // Estado inicial: Autenticado
    const cookies = await page.context().cookies();
    const token = cookies.find(c => c.name === 'devai_auth_token')?.value;

    expect(token).toBeDefined();

    // 1. Fazer requisição GET /api/v1/products com token válido
    const response = await request.get(`${API_BASE}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Resultado esperado:
    // - Status 200
    expect(response.status()).toBe(200);
  });

  test('8.3 Acesso público a categorias', async ({ request }) => {
    // 1. Fazer requisição GET /api/v1/categories
    const response = await request.get(`${API_BASE}/categories`);

    // Resultado esperado:
    // - Status 200
    expect(response.status()).toBe(200);

    // - Lista de categorias retornada
    const data = await response.json();
    expect(Array.isArray(data) || Array.isArray(data.items) || Array.isArray(data.data)).toBeTruthy();
  });

});
