const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders customers list (/customers_private):
router.get("", function (req, res) {
  const selectQuery = `SELECT * FROM customers`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    const customers = rows;
    res.render("customers_private", { customers });
  });
});

// renders the "add customer" form
router.get("/new", function (req, res) {
  res.render("customers_private/new");
});

// receives the form submission of the "add customer" form
router.post("/new", function (req, res) {});

// renders the "edit customer" form
router.get("/:id/edit", function (req, res) {
  const selectQuery = `SELECT * FROM customers WHERE customer_id=${req.params.id}`;
  db.pool.query(selectQuery, function (error, rows, fields) {
    const customer = rows[0];
    res.render("customers_private/edit", { customer });
  });
});

// receives the form submission of the "edit customer" form
router.post("/:id/edit", function (req, res) {
  const firstName = req.body["input-first-name"];
  const lastName = req.body["input-last-name"];
  const email = req.body["input-email"];
  const customerID = req.params.id;

  const updateCustomerQuery = `UPDATE customers SET first_name = '${firstName}', last_name = '${lastName}', email = '${email}'
  WHERE customer_id = ${customerID}`;

  db.pool.query(updateCustomerQuery, function (error, rows, fields) {
    console.log(error);
    res.redirect("/customers_private");
  });
});

// receives the form submission of the "delete customer" form
router.delete("/:id/delete", function (req, res) {
  // make a sql query to UPDATE the customer
});

module.exports = {
  router,
};
