const supabase = require("../config/supabaseClient");
const { runMysqlQuery } = require("../config/mysqlConfig");
const { bucket } = require("./supabaseStorage");

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

async function checkStorage() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);
  if (!(data || []).some((item) => item.name === bucket)) {
    throw new Error(`Storage bucket "${bucket}" was not found`);
  }
  return { ok: true, message: `Storage bucket "${bucket}" exists` };
}

async function checkDatabase() {
  await runMysqlQuery("SELECT 1");

  const missingTables = [];
  for (const tableName of requiredTables) {
    const rows = await runMysqlQuery(`SELECT to_regclass('public.${tableName}') AS table_name`);
    if (!rows?.[0]?.table_name) missingTables.push(tableName);
  }

  if (missingTables.length) {
    throw new Error(`Missing tables: ${missingTables.join(", ")}`);
  }

  return { ok: true, message: "Database connection works and required tables exist" };
}

async function getSupabaseHealth() {
  const checks = {};

  for (const [name, check] of [
    ["storage", checkStorage],
    ["database", checkDatabase],
  ]) {
    try {
      checks[name] = await check();
    } catch (error) {
      checks[name] = { ok: false, message: error.message };
    }
  }

  return {
    ok: Object.values(checks).every((check) => check.ok),
    checks,
  };
}

module.exports = {
  getSupabaseHealth,
};
