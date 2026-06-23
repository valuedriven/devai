// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('7. Validação de Token (Backend)', () => {

  test('7.1 Token expirado', async ({ request }) => {
    // 1. Gerar JWT expirado manualmente ou usar um mock string formatada como JWT
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: '123', exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64url');
    const signature = 'fake_signature';
    const expiredToken = `${header}.${payload}.${signature}`;

    // 2. Fazer requisição para endpoint protegido com Authorization: Bearer <token_expirado>
    const response = await request.get('http://localhost:3001/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    // Resultado esperado:
    // - Status 401
    expect(response.status()).toBe(401);
  });

  test('7.2 Token inválido/mal formatado', async ({ request }) => {
    // 1. Fazer requisição para endpoint protegido com Authorization: Bearer token_invalido
    const response = await request.get('http://localhost:3001/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer token_totalmente_invalido`
      }
    });

    // Resultado esperado:
    // - Status 401
    expect(response.status()).toBe(401);
  });

  test('7.3 Token ausente', async ({ request }) => {
    // 1. Fazer requisição para endpoint protegido sem header Authorization
    const response = await request.get('http://localhost:3001/api/v1/auth/me');

    // Resultado esperado:
    // - Status 401
    expect(response.status()).toBe(401);
  });

});
