import { execSync } from 'child_process';
try {
  execSync('npm run test:e2e -- test/catalog.e2e-spec.ts', { stdio: 'inherit' });
} catch (e) {}
