const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbHost =
  !process.env.DB_HOST || process.env.DB_HOST === "libreria"
    ? "localhost"
    : process.env.DB_HOST;
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "1234";
const dbName = process.env.DB_NAME || "libreria";
const dbPort = Number(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
