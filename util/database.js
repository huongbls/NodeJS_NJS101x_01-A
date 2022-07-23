const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  username: "root",
  database: "node-complete",
  password: "@Abc123456789",
});

module.exports = pool.promise();
