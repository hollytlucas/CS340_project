const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders customers list (/customer_private):
router.get("", function (req, res) {
  let selectQuery;

  if (req.query.id != undefined) {
    selectQuery = `SELECT * FROM customers`;

    db.pool.query(selectQuery, function (error, rows, fields) {
      const customers = rows;
      return res.render("customers_private/index", { data: customers });
    });
  } else {
    selectQuery = "SELECT * FROM customers;";

    db.pool.query(selectQuery, function (error, rows, fields) {
      const customers = rows;
      return res.render("customers_private/index", { data: customers });
    });
  }
});

// renders the "add customer" form
router.get("/new", function (req, res) {
  res.render("customers_private/new");
});

// receives the form submission of the "add customer" form
router.post("/new", function (req, res) {});

router.get("/:id/edit", function (req, res) {
  const selectQuery = `SELECT * FROM customers WHERE customer_id=${req.params.id}`;
  db.pool.query(selectQuery, function (error, rows, fields) {
    const customer = rows[0];
    res.render("customers_private/edit", { customer });
  });
});

router.post("/:id/edit", function (req, res) {
  res.redirect("/customers_private");
});

// receives the form submission of the "delete customer" form
router.delete("/:id/delete", function (req, res) {
  // make a sql query to UPDATE the customer
});

module.exports = {
  router,
};
