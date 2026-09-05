import "dotenv/config";
import { execFileSync } from "child_process";
import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Client } from "pg";
import { DB_SETTINGS, SERVER_SETTINGS } from "../src/settings";

/** Baseline only a database that exactly matches the committed initial schema. */
export async function baselineExistingDatabase(replaceMissingHistory = false) {
  if (SERVER_SETTINGS.nodeEnv === "production")
    throw new Error(
      "Use a reviewed migration baseline procedure in production.",
    );
  const root = resolve(__dirname, "..");
  const cli = resolve(root, "node_modules/prisma/build/index.js");
  const url = new URL(DB_SETTINGS.url);
  const schema = url.searchParams.get("schema") || "public";
  const migrationTable = `"${schema.replace(/"/g, '""')}"."_prisma_migrations"`;
  const client = new Client({ connectionString: DB_SETTINGS.url });
  await client.connect();
  try {
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = $2",
      [schema, "BASE TABLE"],
    );
    const names = tables.rows.map(
      (row: { table_name: string }) => row.table_name,
    );
    const history = names.includes("_prisma_migrations")
      ? (await client.query(`SELECT * FROM ${migrationTable}`)).rows
      : [];
    const applicationTables = names.filter(
      (name) => name !== "_prisma_migrations",
    );
    if (!applicationTables.length) {
      if (
        history.some(
          (row) => row.finished_at && !row.rolled_back_at,
        )
      )
        throw new Error(
          "Migration history marks a migration as applied, but no application tables exist. Restore the database from backup or reset this empty local database before continuing.",
        );
      // Prisma may have created an empty migration metadata table before an
      // interrupted first deployment. There is no schema to baseline yet.
      return;
    }
    if (
      history.some(
        (row) =>
          row.migration_name === "20260905000000_initial" &&
          row.finished_at &&
          !row.rolled_back_at,
      )
    )
      return;
    const missing = history.filter(
      (row) =>
        !existsSync(
          resolve(
            root,
            "prisma/migrations",
            row.migration_name,
            "migration.sql",
          ),
        ),
    );
    if (missing.length && !replaceMissingHistory)
      throw new Error(
        "Migration files are missing. Run db:baseline -- --replace-missing-history after reviewing the schema match.",
      );
    if (
      missing.length &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      throw new Error(
        "Replacing missing migration history is limited to local databases.",
      );
    // Exit code 2 means drift; never mark a mismatching schema as already migrated.
    execFileSync(
      process.execPath,
      [
        cli,
        "migrate",
        "diff",
        "--from-schema-datasource",
        "prisma/schema.prisma",
        "--to-schema-datamodel",
        "prisma/schema.prisma",
        "--exit-code",
      ],
      {
        cwd: root,
        env: { ...process.env, DATABASE_URL: DB_SETTINGS.url },
        stdio: "pipe",
      },
    );
    if (missing.length) {
      const backupDir = resolve(root, "../tmp");
      mkdirSync(backupDir, { recursive: true });
      const backup = resolve(backupDir, `migration-history-${Date.now()}.json`);
      writeFileSync(backup, JSON.stringify({ schema, history }, null, 2));
      console.log(`Previous migration metadata backed up to ${backup}`);
      await client.query("BEGIN");
      await client.query(
        `DELETE FROM ${migrationTable} WHERE id = ANY($1::varchar[])`,
        [missing.map((row) => row.id)],
      );
    }
    try {
      execFileSync(
        process.execPath,
        [cli, "migrate", "resolve", "--applied", "20260905000000_initial"],
        {
          cwd: root,
          env: { ...process.env, DATABASE_URL: DB_SETTINGS.url },
          stdio: "inherit",
        },
      );
      if (missing.length) await client.query("COMMIT");
    } catch (error) {
      if (missing.length) await client.query("ROLLBACK");
      throw error;
    }
    console.log(
      "Existing schema matched the initial migration and was baselined without resetting data.",
    );
  } finally {
    await client.end();
  }
}
if (require.main === module)
  baselineExistingDatabase(
    process.argv.includes("--replace-missing-history"),
  ).catch(() => {
    console.error(
      "Baseline refused: connection/schema mismatch or missing migration history. Review prisma migrate diff; use --replace-missing-history only for a local database with lost migration files.",
    );
    process.exitCode = 1;
  });
