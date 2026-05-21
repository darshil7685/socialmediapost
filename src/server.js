import './config/env.js';
import app from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';

try {
  await runMigrations();
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
