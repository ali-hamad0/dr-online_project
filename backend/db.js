
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // usually needed when connecting to managed postgres from outside
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function q(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { pool, q };
