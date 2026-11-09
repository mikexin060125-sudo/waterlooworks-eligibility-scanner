
const { Pool } = require("pg");

const pool = new Pool({
  host: "::1",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "eligibility_scanner"
});

module.exports = pool;
