// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DB,
// });

// db.connect((err) => {
//   if (err) {
//     console.error("MySQL connection error:", err.stack);
//     return;
//   }
//   console.log("Connected to MySQL");
// });

// module.exports = db;
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});

module.exports = db;
