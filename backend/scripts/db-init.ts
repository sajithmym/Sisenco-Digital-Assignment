/**
 * db-init.ts — Full database initialization script
 *
 * Usage:  npm run db-init
 *
 * Steps:
 *   1. Read database config from .env
 *   2. Create database if it does not exist
 *   3. Generate Prisma client
 *   4. Run migrations (create all tables)
 *   5. Seed the database
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Helpers ────────────────────────────────────────────────

const ROOT = resolve(__dirname, '..');

function loadEnv(): Record<string, string> {
  const envPath = resolve(ROOT, '.env');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
    // Also set in process.env so child processes inherit it
    process.env[key] = value;
  }

  return env;
}

function run(cmd: string, label: string) {
  console.log(`\n▶ ${label}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ ${label} — done`);
  } catch {
    console.error(`❌ ${label} — failed`);
    process.exit(1);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Weekly Report — Database Init Script   ║');
  console.log('╚══════════════════════════════════════════╝');

  // 1. Load .env
  console.log('\n▶ Loading .env ...');
  const env = loadEnv();
  const dbHost = env.DB_HOST || 'localhost';
  const dbPort = env.DB_PORT || '5432';
  const dbUser = env.DB_USER || 'postgres';
  const dbPassword = env.DB_PASSWORD || 'postgres';
  const dbName = env.DB_NAME || 'weekly_report_db';

  console.log(`  Host: ${dbHost}`);
  console.log(`  Port: ${dbPort}`);
  console.log(`  User: ${dbUser}`);
  console.log(`  Database: ${dbName}`);

  // 2. Create database if not exists
  console.log('\n▶ Creating database ...');
  try {
    execSync(
      `PGPASSWORD=${dbPassword} psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -tc "SELECT 1 FROM pg_database WHERE datname='${dbName}'"`,
      { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
  } catch {
    // psql not available or connection failed — try anyway
  }

  // Check if DB exists
  let dbExists = false;
  try {
    const result = execSync(
      `PGPASSWORD=${dbPassword} psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -tc "SELECT 1 FROM pg_database WHERE datname='${dbName}'"`,
      { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
    dbExists = result.trim().includes('1');
  } catch {
    // ignore
  }

  if (!dbExists) {
    run(
      `PGPASSWORD=${dbPassword} psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -c "CREATE DATABASE ${dbName};"`,
      'Create database',
    );
  } else {
    console.log(`  Database "${dbName}" already exists — skipping creation`);
  }

  // 3. Generate Prisma client
  run('npx prisma generate', 'Generate Prisma Client');

  // 4. Run migrations
  run('npx prisma migrate dev --name init', 'Run database migrations');

  // 5. Seed
  run('npx prisma db seed', 'Seed database');

  // Done
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         🎉 Database initialized!         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('\nYou can now start the server:');
  console.log('  npm run start:dev');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Manager:     sarah@example.com / password123');
  console.log('  Team Member: kasun@example.com / password123');
  console.log('');
}

main().catch((err) => {
  console.error('❌ Init failed:', err.message);
  process.exit(1);
});
