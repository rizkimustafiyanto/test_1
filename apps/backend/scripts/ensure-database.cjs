const path = require("path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

function escapeIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function ensureDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in apps/backend/.env");
  }

  const targetUrl = new URL(databaseUrl);
  const databaseName = targetUrl.pathname.replace(/^\//, "");

  if (!databaseName) {
    throw new Error("DATABASE_URL does not contain a database name");
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";
  adminUrl.search = "";

  const client = new Client({
    connectionString: adminUrl.toString(),
  });

  await client.connect();

  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`Database "${databaseName}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE ${escapeIdentifier(databaseName)}`);
    console.log(`Database "${databaseName}" created.`);
  } finally {
    await client.end();
  }
}

ensureDatabase().catch((error) => {
  console.error("Failed to ensure database exists.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
