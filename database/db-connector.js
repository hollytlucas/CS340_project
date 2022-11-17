// Get an instance of mysql we can use in the app
var mysql = require("mysql");

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "database-2.clc3dlkbok9d.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "TonyJanSavannah49",
  database: "lucasho",
});
// var pool = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "kelleysharp",
//   password: "password",
//   database: "house_finch",
// });

// Export it for use in our application
module.exports.pool = pool;
