/**
 * Development database bootstrap.
 *
 * Database creation uses the PostgreSQL Node driver, so this command works on
 * Windows, macOS, Linux, and Docker without a separately installed `psql` CLI.
 * Production deployments must use `prisma migrate deploy` in their release
 * pipeline and must not run seed data automatically.
 */
import { execFileSync } from 'child_process';
import { config as loadDotenv } from 'dotenv';
import { Client } from 'pg';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const DATABASE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PRISMA_CLI = resolve(ROOT, 'node_modules', 'prisma', 'build', 'index.js');

function run(command: string, args: string[], label: string, env: NodeJS.ProcessEnv) {
  console.log(`\n▶ ${label}`);
  execFileSync(command, args, { cwd: ROOT, env, stdio: 'inherit' });
  console.log(`✅ ${label} — done`);
}

async function ensureDatabase(options: {
  host: string;
  port: number;
  user: string;
  password: string;
  databaseName: string;
}) {
  const client = new Client({
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.password,
    database: 'postgres',
  });

  await client.connect();

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [options.databaseName]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${options.databaseName}"`);
      console.log(`✅ Database "${options.databaseName}" created`);
    } else {
      console.log(`✅ Database "${options.databaseName}" already exists`);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('db:init is for local development only. Use prisma migrate deploy in production.');
  }

  loadDotenv({ path: resolve(ROOT, '.env') });
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT || '5432');
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbName = process.env.DB_NAME || 'weekly_report_db';

  if (!DATABASE_NAME_PATTERN.test(dbName)) {
    throw new Error('DB_NAME may contain only letters, numbers, and underscores.');
  }

  if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535.');
  }

  console.log('▶ Checking database ...');
  await ensureDatabase({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    databaseName: dbName,
  });

  const commandEnvironment = { ...process.env, PGPASSWORD: dbPassword };
  run(process.execPath, [PRISMA_CLI, 'generate'], 'Generate Prisma Client', commandEnvironment);
  run(process.execPath, [PRISMA_CLI, 'migrate', 'deploy'], 'Apply migrations', commandEnvironment);
  run(process.execPath, [PRISMA_CLI, 'db', 'seed'], 'Seed development data', commandEnvironment);
}

main().catch((error) => {
  console.error('❌ Database initialization failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
