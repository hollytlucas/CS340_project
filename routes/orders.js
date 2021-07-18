const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders orders list (/orders):
router.get("", function (req, res) {
  let selectQuery;

  if (req.query.id != undefined) {
    selectQuery = `SELECT * FROM orders`;

    db.pool.query(selectQuery, function (error, rows, fields) {
      let orders = rows;
      return res.render("orders", { data: orders });
    });
  } else {
    selectQuery = "SELECT * FROM orders;";

    db.pool.query(selectQuery, function (error, rows, fields) {
      let orders = rows;
      return res.render("orders/index", { data: orders });
    });
  }
});

// renders the "add order" form
router.get("/new", function (req, res) {
  res.render("orders/new");
});

// receives the form submission of the "add order" form
router.post("/new", function (req, res) {});

// receives the form submission of the "delete order" form
router.delete("/:id/delete", function (req, res) {
  // make a sql query to UPDATE the order
});

module.exports = {
  router,
};
