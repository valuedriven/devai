import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envPath = resolve(__dirname, '../../../.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}
