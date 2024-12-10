const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = mysqlPool;

// const mysql = require("mysql2/promise");
// const dotenv = require("dotenv");
// dotenv.config({ path: "backend/config/config.env" });

// const mysqlPool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "unitradebot",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });
// module.exports = mysqlPool;
