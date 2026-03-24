import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
console.log('[Env] Environment variables loaded.');
