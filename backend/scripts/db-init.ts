/**
 * Development database bootstrap.
 *
 * Database creation uses the PostgreSQL Node driver, so this command works on
 * Windows, macOS, Linux, and Docker without a separately installed `psql` CLI.
 * Production deployments must use `prisma migrate deploy` in their release
 * pipeline and must not run seed data automatically.
 */
import { execFileSync } from "child_process";
import { config as loadDotenv } from "dotenv";
import { Client } from "pg";
import { resolve } from "path";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { baselineExistingDatabase } from "./baseline";
import { DB_SETTINGS } from "../src/settings";

const ROOT = resolve(__dirname, "..");
const DATABASE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PRISMA_CLI = resolve(ROOT, "node_modules", "prisma", "build", "index.js");
const INITIAL_MIGRATION = "20260905000000_initial";

function run(
  command: string,
  args: string[],
  label: string,
  env: NodeJS.ProcessEnv,
) {
  console.log(`\n▶ ${label}`);
  execFileSync(command, args, { cwd: ROOT, env, stdio: "inherit" });
  console.log(`✅ ${label} — done`);
}

/**
 * Rebuild the initial development migration only when the checkout has none.
 * Existing migration directories are never modified: their history must remain
 * reproducible and be repaired from source control instead.
 */
function ensureMigrationsAvailable() {
  const migrationsRoot = resolve(ROOT, "prisma", "migrations");
  const entries = existsSync(migrationsRoot)
    ? readdirSync(migrationsRoot, { withFileTypes: true })
    : [];
  const migrationDirectories = entries.filter((entry) => entry.isDirectory());
  const usableMigrations = migrationDirectories.filter((entry) =>
    existsSync(resolve(migrationsRoot, entry.name, "migration.sql")),
  );
  if (usableMigrations.length) return;
  if (migrationDirectories.length) {
    throw new Error(
      "A Prisma migration directory is incomplete. Restore backend/prisma/migrations from Git before running db:init.",
    );
  }

  try {
    const sql = execFileSync(
      process.execPath,
      [
        PRISMA_CLI,
        "migrate",
        "diff",
        "--from-empty",
        "--to-schema-datamodel",
        "prisma/schema.prisma",
        "--script",
      ],
      { cwd: ROOT, encoding: "utf8", env: process.env },
    );
    if (!sql.trim()) throw new Error("Prisma generated an empty migration.");
    const initialDirectory = resolve(migrationsRoot, INITIAL_MIGRATION);
    mkdirSync(initialDirectory, { recursive: true });
    writeFileSync(resolve(initialDirectory, "migration.sql"), sql);
    writeFileSync(
      resolve(migrationsRoot, "migration_lock.toml"),
      'provider = "postgresql"\n',
    );
    console.log(
      `✅ Generated ${INITIAL_MIGRATION} from prisma/schema.prisma. Commit backend/prisma/migrations to Git.`,
    );
  } catch (error) {
    throw new Error(
      `Could not generate the initial Prisma migration: ${error instanceof Error ? error.message : error}`,
    );
  }
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
    database: "postgres",
  });

  await client.connect();

  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [options.databaseName],
    );

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
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "db:init is for local development only. Use prisma migrate deploy in production.",
    );
  }

  loadDotenv({ path: resolve(ROOT, ".env") });
  ensureMigrationsAvailable();
  const url = new URL(DB_SETTINGS.url);
  const dbHost = url.hostname;
  const dbPort = Number(url.port || 5432);
  const dbUser = decodeURIComponent(url.username);
  const dbPassword = decodeURIComponent(url.password);
  const dbName = decodeURIComponent(url.pathname.slice(1));

  if (!DATABASE_NAME_PATTERN.test(dbName)) {
    throw new Error(
      "DB_NAME may contain only letters, numbers, and underscores.",
    );
  }

  if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error("DB_PORT must be an integer between 1 and 65535.");
  }

  console.log("▶ Checking database ...");
  await ensureDatabase({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    databaseName: dbName,
  });

  await baselineExistingDatabase();
  const commandEnvironment = { ...process.env, PGPASSWORD: dbPassword };
  run(
    process.execPath,
    [PRISMA_CLI, "generate"],
    "Generate Prisma Client",
    commandEnvironment,
  );
  run(
    process.execPath,
    [PRISMA_CLI, "migrate", "deploy"],
    "Apply migrations",
    commandEnvironment,
  );
  run(
    process.execPath,
    ["-r", "ts-node/register", "prisma/seed.ts"],
    "Seed development data",
    commandEnvironment,
  );
}

main().catch((error) => {
  console.error(
    "❌ Database initialization failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
