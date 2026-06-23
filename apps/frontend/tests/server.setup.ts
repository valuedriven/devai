import { FullConfig } from '@playwright/test';

async function waitForServer(url: string, name: string, timeoutMs: number = 120000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      await fetch(url);
      console.log(`✅ Servidor ${name} está respondendo em ${url}`);
      return;
    } catch {
      // Ignore and retry
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error(`\n❌ ERRO FATAL: Servidor ${name} não está acessível em ${url} após ${timeoutMs}ms.\nCertifique-se de que os servidores backend e frontend estejam em execução.\n`);
}

async function globalSetup(config: FullConfig) {
  console.log('\n⏳ Verificando integridade dos servidores...');
  
  // Verifica Frontend
  await waitForServer('http://localhost:3000', 'Frontend');
  
  // Verifica Backend (via um endpoint público ou raiz)
  await waitForServer('http://localhost:3001/api/v1/products', 'Backend');
}

export default globalSetup;
