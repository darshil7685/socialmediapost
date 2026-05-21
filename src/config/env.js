import 'dotenv/config';

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'DATABASE_URL',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (
  serviceRoleKey.includes('publishable') ||
  serviceRoleKey.startsWith('sb_publishable_')
) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY must be the service_role secret from Supabase Dashboard → Settings → API, not the publishable/anon key'
  );
}

const databaseUrl = process.env.DATABASE_URL;
const databaseSsl =
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_SSL !== 'false' &&
    databaseUrl.includes('supabase.co'));

export const env = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl,
  databaseSsl,
  metaGraphVersion: process.env.META_GRAPH_VERSION || 'v21.0',
};
