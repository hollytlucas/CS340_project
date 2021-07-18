const express = require("express");
const router = express.Router();

// renders orders list (/orders):
router.get("", function (req, res) {
  let query1;

  // If there is a query string, we run the query
  if (req.query.id != undefined) {
    query1 = `SELECT * FROM orders`;
    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {
      // Save the waiters
      let orders = rows;
      return res.render("orders", { data: orders });
    });
  } else {
    // Query 1 is select all waiters if name search is blank
    let query1 = "SELECT * FROM orders;";

    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {
      // Save the orders
      let orders = rows;
      return res.render("orders/index", { data: orders });
    });
  }
});

// renders the "add order" form
router.get("/new", function (req, res) {});

// receives the form submission of the "add order" form
router.post("/new", function (req, res) {});

// receives the form submission of the "delete order" form
router.delete("/:id/delete", function (req, res) {
  // make a sql query to UPDATE the order
});

module.exports = {
  router,
};
