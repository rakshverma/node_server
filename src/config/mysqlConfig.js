const { Pool } = require("pg");
const config = require("./index").get(process.env.ENV);

const dbUrl = process.env.SUPABASE_DB_URL || process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL || config.supabase?.dbUrl;

if (!dbUrl) {
  console.warn("SUPABASE_DB_URL, SUPABASE_POSTGRES_URL, or DATABASE_URL is not set. Database queries will fail until Supabase DB connection details are configured.");
}

const sslConfig =
  process.env.SUPABASE_DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : process.env.SUPABASE_DB_SSL === "false"
    ? false
    : dbUrl && /supabase\.(com|co)|pooler/i.test(dbUrl)
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
});

const camelCaseIdentifiers = ["cartId", "userId", "productId", "franchiseId", "shippingCost"];

function splitAssignments(assignments) {
  const parts = [];
  let current = "";
  let quote = null;

  for (const char of assignments) {
    if ((char === "'" || char === '"') && current[current.length - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
    }
    if (char === "," && !quote) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function convertInsertSet(sql) {
  const match = sql.match(/^\s*INSERT\s+INTO\s+([^\s]+)\s+SET\s+([\s\S]+)$/i);
  if (!match) return sql;

  const table = match[1];
  const assignments = splitAssignments(match[2]);
  const columns = [];
  const values = [];

  assignments.forEach((assignment) => {
    const index = assignment.indexOf("=");
    if (index === -1) return;
    columns.push(assignment.slice(0, index).trim());
    const value = assignment.slice(index + 1).trim();
    values.push(value === "\"\"" ? "''" : value);
  });

  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")})`;
}

function convertMysqlFunctions(sql) {
  let converted = sql.replace(/`/g, "");
  converted = converted.replace(/\bIFNULL\s*\(/gi, "COALESCE(");
  converted = converted.replace(/\bJSON_CONTAINS\s*\(\s*([a-zA-Z0-9_."]+)\s*,\s*\?\s*\)/gi, "$1::jsonb @> ?::jsonb");
  converted = converted.replace(
    /\bIF\s*\(\s*u\.role_id\s*=\s*2\s*,\s*\((SELECT[\s\S]*?)\)\s*,\s*NULL\s*\)\s+AS\s+franchise_name/gi,
    "CASE WHEN u.role_id = 2 THEN ($1) ELSE NULL END AS franchise_name"
  );
  return converted;
}

function convertLimitSyntax(sql) {
  return sql.replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)/gi, "LIMIT $2 OFFSET $1");
}

function convertDuplicateKeySyntax(sql) {
  return sql.replace(
    /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+user_id\s*=\s*VALUES\s*\(\s*user_id\s*\)\s*,\s*shipping_cost\s*=\s*VALUES\s*\(\s*shipping_cost\s*\)/gi,
    "ON CONFLICT (user_id, pin_code) DO UPDATE SET user_id = EXCLUDED.user_id, shipping_cost = EXCLUDED.shipping_cost"
  );
}

function quoteCamelCaseIdentifiers(sql) {
  return camelCaseIdentifiers.reduce((nextSql, identifier) => {
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return nextSql.replace(new RegExp(`(?<!")\\b${escaped}\\b(?!")`, "g"), `"${identifier}"`);
  }, sql);
}

function convertBulkValues(sql, params) {
  const valuesParam = params?.[0];
  if (!/VALUES\s*\?/i.test(sql) || !Array.isArray(valuesParam) || !Array.isArray(valuesParam[0])) {
    return null;
  }

  const flatParams = [];
  const valueSql = valuesParam
    .map((row) => {
      const placeholders = row.map((value) => {
        flatParams.push(value);
        return `$${flatParams.length}`;
      });
      return `(${placeholders.join(", ")})`;
    })
    .join(", ");

  return {
    sql: sql.replace(/VALUES\s*\?/i, `VALUES ${valueSql}`),
    params: flatParams,
  };
}

function convertInArrayPlaceholders(sql, params) {
  const convertedParams = [];
  let paramIndex = 0;

  const convertedSql = sql.replace(/\bIN\s*\(\s*\?\s*\)/gi, () => {
    const value = params[paramIndex++];
    convertedParams.push(Array.isArray(value) ? value : [value]);
    return `= ANY($${convertedParams.length})`;
  });

  return { sql: convertedSql, params: convertedParams, consumed: paramIndex };
}

function convertPlaceholders(sql, params = []) {
  const bulk = convertBulkValues(sql, params);
  if (bulk) return bulk;

  const inArray = convertInArrayPlaceholders(sql, params);
  const remainingParams = params.slice(inArray.consumed);
  let nextIndex = inArray.params.length;

  const convertedSql = inArray.sql.replace(/\?/g, () => `$${++nextIndex}`);
  return {
    sql: convertedSql,
    params: [...inArray.params, ...remainingParams],
  };
}

function normalizeResult(result) {
  const command = result.command?.toUpperCase();
  if (command === "SELECT") return result.rows;

  const response = {
    affectedRows: result.rowCount,
    rowCount: result.rowCount,
    rows: result.rows,
  };

  if (result.rows?.[0]?.id) response.insertId = result.rows[0].id;
  return response;
}

function prepareQuery(query, queryParams = []) {
  const params = Array.isArray(queryParams) ? queryParams : [queryParams];
  let sql = convertInsertSet(query);
  sql = convertMysqlFunctions(sql);
  sql = convertLimitSyntax(sql);
  sql = convertDuplicateKeySyntax(sql);
  sql = quoteCamelCaseIdentifiers(sql);

  if (/^\s*INSERT\b/i.test(sql) && !/\bRETURNING\b/i.test(sql)) {
    sql = `${sql} RETURNING id`;
  }

  return convertPlaceholders(sql, params);
}

async function runPgQuery(query, queryParams = [], client = pool) {
  const { sql, params } = prepareQuery(query, queryParams);
  const result = await client.query(sql, params);
  return normalizeResult(result);
}

function mysqlConnect() {
  return pool.connect();
}

function runMysqlQuery(query) {
  return runPgQuery(query);
}

function runMysqlQueryWithParam(query, queryParams) {
  return runPgQuery(query, queryParams);
}

function beginTransaction(connection) {
  return connection.query("BEGIN");
}

function commit(connection) {
  return connection.query("COMMIT");
}

function rollback(connection) {
  return connection.query("ROLLBACK");
}

function runTransectionQuery(connection, sql, params) {
  return runPgQuery(sql, params, connection);
}

module.exports = {
  mysqlConnect,
  runMysqlQuery,
  runMysqlQueryWithParam,
  beginTransaction,
  commit,
  rollback,
  runTransectionQuery,
};
