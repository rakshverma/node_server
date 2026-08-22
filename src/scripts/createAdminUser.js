require("dotenv").config();

const bcrypt = require("bcryptjs");
const { runMysqlQueryWithParam } = require("../config/mysqlConfig");
const config = require("../config").get(process.env.ENV);

const email = `${process.env.ADMIN_EMAIL || ""}`.trim().toLowerCase();
const password = `${process.env.ADMIN_PASSWORD || ""}`.trim();
const name = `${process.env.ADMIN_NAME || "JhatkaByte Admin"}`.trim();
const phone = `${process.env.ADMIN_PHONE || "9999999999"}`.trim();

async function main() {
  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  const hashedPassword = bcrypt.hashSync(password, config.saltRounds);
  const existing = await runMysqlQueryWithParam("SELECT id FROM tbl_users WHERE email=? AND role_id=1", [email]);

  if (existing.length) {
    await runMysqlQueryWithParam("UPDATE tbl_users SET name=?, phone_number=?, password=?, status=1 WHERE id=?", [
      name,
      phone,
      hashedPassword,
      existing[0].id,
    ]);
    console.log(`Admin user updated: ${email}`);
    return;
  }

  const insert = await runMysqlQueryWithParam(
    "INSERT INTO tbl_users SET name=?, email=?, password=?, role_id=1, phone_number=?, status=1",
    [name, email, hashedPassword, phone]
  );

  await runMysqlQueryWithParam(
    "INSERT INTO tbl_franchise_details SET user_id=?, franchise_name=?, state=?, district=?, zip_codes=?",
    [insert.insertId, "JhatkaByte Admin", "", "", JSON.stringify([])]
  );

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin user:", error.message);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
