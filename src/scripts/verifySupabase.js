require("dotenv").config();

const supabase = require("../config/supabaseClient");
const { runMysqlQuery } = require("../config/mysqlConfig");
const { bucket } = require("../utils/supabaseStorage");

const requiredTables = [
  "tbl_users",
  "tbl_user_details",
  "tbl_category",
  "tbl_products",
  "tbl_product_price",
  "tbl_franchise_details",
  "tbl_cart",
  "tbl_orders",
  "tbl_order_details",
  "tbl_shipping_cost",
  "mst_pin_codes",
];

function hasAnyEnv(names) {
  return names.some((name) => Boolean(process.env[name]));
}

async function verifyStorage() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const buckets = data || [];
  const found = buckets.some((item) => item.name === bucket);
  if (!found) {
    throw new Error(`Storage bucket "${bucket}" was not found`);
  }

  return `Storage bucket "${bucket}" exists`;
}

async function verifyDatabase() {
  await runMysqlQuery("SELECT 1");

  const missingTables = [];
  for (const tableName of requiredTables) {
    const rows = await runMysqlQuery(`SELECT to_regclass('public.${tableName}') AS table_name`);
    if (!rows?.[0]?.table_name) missingTables.push(tableName);
  }

  if (missingTables.length) {
    throw new Error(`Missing tables: ${missingTables.join(", ")}`);
  }

  return "Database connection works and required tables exist";
}

async function verifyTablesViaApi() {
  const inaccessibleTables = [];

  for (const tableName of requiredTables) {
    const { error } = await supabase.from(tableName).select("*").limit(1);
    if (error) inaccessibleTables.push(`${tableName}: ${error.message}`);
  }

  if (inaccessibleTables.length) {
    throw new Error(`Tables missing or inaccessible through Supabase API:\n${inaccessibleTables.join("\n")}`);
  }

  return "Required tables are accessible through the Supabase API";
}

async function main() {
  let failed = false;

  if (!hasAnyEnv(["SUPABASE_URL"]) || !hasAnyEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"])) {
    console.error("Storage check skipped: SUPABASE_URL and Supabase service/secret key are required");
    failed = true;
  } else {
    try {
      console.log(await verifyStorage());
    } catch (error) {
      console.error(`Storage check failed: ${error.message}`);
      failed = true;
    }
  }

  if (!hasAnyEnv(["SUPABASE_DB_URL", "SUPABASE_POSTGRES_URL"])) {
    console.error("Database check skipped: SUPABASE_DB_URL or SUPABASE_POSTGRES_URL is required");
    if (hasAnyEnv(["SUPABASE_URL"]) && hasAnyEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"])) {
      try {
        console.log(await verifyTablesViaApi());
      } catch (error) {
        console.error(`Supabase API table check failed: ${error.message}`);
      }
    }
    failed = true;
  } else {
    try {
      console.log(await verifyDatabase());
    } catch (error) {
      console.error(`Database check failed: ${error.message}`);
      failed = true;
    }
  }

  if (failed) process.exit(1);
  console.log("Supabase verification passed");
}

main();
