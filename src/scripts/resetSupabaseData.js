require("dotenv").config();

const { runMysqlQuery } = require("../config/mysqlConfig");

const CONFIRMATION = "RESET_JHATKABYTE_DATA";

const tables = [
  "tbl_order_details",
  "tbl_orders",
  "tbl_cart",
  "tbl_product_review",
  "tbl_product_price",
  "tbl_products",
  "tbl_category",
  "tbl_shipping_cost",
  "tbl_delevery_boy_details",
  "tbl_franchise_details",
  "tbl_franchise_requests",
  "tbl_user_details",
  "tbl_users",
];

async function resetData() {
  if (process.env.CONFIRM_RESET !== CONFIRMATION) {
    throw new Error(`Refusing to reset data. Set CONFIRM_RESET=${CONFIRMATION} to continue.`);
  }

  await runMysqlQuery(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  console.log(`Reset complete. Cleared ${tables.length} application tables.`);
}

resetData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
