import '../config/env.js';
import { runMigrations } from '../db/migrate.js';

try {
  await runMigrations();
  console.log('Migrations complete');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
