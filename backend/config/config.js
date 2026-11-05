const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbHost =
  !process.env.DB_HOST || process.env.DB_HOST === "libreria"
    ? "localhost"
    : process.env.DB_HOST;

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "libreria",
    host: dbHost,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "libreria",
    host: dbHost,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "libreria",
    host: dbHost,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false
  }
};
