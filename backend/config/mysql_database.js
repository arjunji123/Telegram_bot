const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || ";B@$aY=G9qwsK98PV:c7",
  database: process.env.DB_NAME || "unitrade",
  port: process.env.DB_PORT || 3306,
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


