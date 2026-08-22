require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const dbUrl = process.env.SUPABASE_DB_URL || process.env.SUPABASE_POSTGRES_URL;

if (!dbUrl) {
  console.error("SUPABASE_DB_URL or SUPABASE_POSTGRES_URL is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.SUPABASE_DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

async function main() {
  const schemaPath = path.join(__dirname, "../../db/supabase_schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schemaSql);
  console.log("Supabase schema applied successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to apply Supabase schema:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
